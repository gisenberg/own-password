import type { KeyPair } from "./types";
import { base64ToUint8Array, uint8ArrayEquals } from "./utils";
import { CorruptedDataError, InvalidPasswordError } from "./errors";

const OPDATA01_MAGIC = new Uint8Array([
  0x6f, 0x70, 0x64, 0x61, 0x74, 0x61, 0x30, 0x31, // "opdata01"
]);

export async function deriveKeys(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<KeyPair> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-512",
    },
    keyMaterial,
    512
  );

  const derived = new Uint8Array(derivedBits);
  return importKeyPair(derived.slice(0, 32), derived.slice(32, 64));
}

async function importKeyPair(
  encKeyBytes: Uint8Array,
  macKeyBytes: Uint8Array
): Promise<KeyPair> {
  const [encKey, macKey] = await Promise.all([
    crypto.subtle.importKey("raw", encKeyBytes, "AES-CBC", false, [
      "encrypt",
      "decrypt",
    ]),
    crypto.subtle.importKey(
      "raw",
      macKeyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    ),
  ]);
  return { encKey, macKey };
}

export async function decryptOpdata01(
  data: Uint8Array,
  encKey: CryptoKey,
  macKey: CryptoKey
): Promise<Uint8Array> {
  // Verify magic bytes
  for (let i = 0; i < 8; i++) {
    if (data[i] !== OPDATA01_MAGIC[i]) {
      throw new CorruptedDataError("Invalid opdata01 magic bytes");
    }
  }

  // Read plaintext length (uint64 LE — read uint32 LE at offset 8)
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const plaintextLen = view.getUint32(8, true);

  // Extract components
  const iv = data.slice(16, 32);
  const ciphertext = data.slice(32, data.length - 32);
  const hmacTag = data.slice(data.length - 32);

  // Verify HMAC-SHA256 over everything except the HMAC tag
  const hmacData = data.slice(0, data.length - 32);
  const computedHmac = new Uint8Array(
    await crypto.subtle.sign("HMAC", macKey, hmacData)
  );

  if (!uint8ArrayEquals(computedHmac, hmacTag)) {
    throw new InvalidPasswordError();
  }

  // Decrypt with AES-CBC padding workaround
  const decrypted = await decryptAesCbcNoPadding(ciphertext, encKey, iv);

  // Return last N bytes (N = plaintext length)
  return decrypted.slice(decrypted.length - plaintextLen);
}

/**
 * AES-CBC decryption workaround for Web Crypto API.
 *
 * Web Crypto always applies PKCS#7 unpadding, but OPVault uses its own
 * padding scheme. Workaround from keanulee/opvault-viewer:
 * 1. Create a fake PKCS#7 block (16 bytes of 0x10)
 * 2. Encrypt it with same key, using last 16 bytes of ciphertext as IV
 * 3. Append the first 16 bytes of result to ciphertext
 * 4. Decrypt extended ciphertext — Web Crypto strips the fake padding
 * 5. The real data is intact
 */
async function decryptAesCbcNoPadding(
  ciphertext: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<Uint8Array> {
  // Create fake PKCS#7 padding block
  const fakePadding = new Uint8Array(16).fill(0x10);

  // Use the last 16 bytes of ciphertext as IV to encrypt the fake block
  const lastBlock = ciphertext.slice(ciphertext.length - 16);
  const encryptedFake = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: lastBlock },
      key,
      fakePadding
    )
  );

  // Append first 16 bytes of encrypted fake to ciphertext
  const extended = new Uint8Array(ciphertext.length + 16);
  extended.set(ciphertext);
  extended.set(encryptedFake.slice(0, 16), ciphertext.length);

  // Decrypt — Web Crypto will strip the fake PKCS#7 padding
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    extended
  );

  return new Uint8Array(decrypted);
}

export async function decryptAndDeriveKeys(
  keyBlob: Uint8Array,
  encKey: CryptoKey,
  macKey: CryptoKey
): Promise<KeyPair> {
  const rawKeyMaterial = await decryptOpdata01(keyBlob, encKey, macKey);

  // SHA-512 hash the raw key material
  const hashed = new Uint8Array(
    await crypto.subtle.digest("SHA-512", rawKeyMaterial)
  );

  // Split into enc + mac keys
  return importKeyPair(hashed.slice(0, 32), hashed.slice(32, 64));
}

export async function decryptItemKey(
  itemKeyB64: string,
  masterEncKey: CryptoKey,
  masterMacKey: CryptoKey
): Promise<KeyPair> {
  const data = base64ToUint8Array(itemKeyB64);

  // item.k format: [IV 16 bytes][ciphertext][HMAC 32 bytes]
  const iv = data.slice(0, 16);
  const ciphertext = data.slice(16, data.length - 32);
  const hmacTag = data.slice(data.length - 32);

  // Verify HMAC over everything except the HMAC tag
  const hmacData = data.slice(0, data.length - 32);
  const computedHmac = new Uint8Array(
    await crypto.subtle.sign("HMAC", masterMacKey, hmacData)
  );

  if (!uint8ArrayEquals(computedHmac, hmacTag)) {
    throw new CorruptedDataError("Item key HMAC verification failed");
  }

  // Decrypt with padding workaround
  const rawKey = await decryptAesCbcNoPadding(ciphertext, masterEncKey, iv);

  // SHA-512 hash → split into enc + mac keys
  const hashed = new Uint8Array(
    await crypto.subtle.digest("SHA-512", rawKey)
  );

  return importKeyPair(hashed.slice(0, 32), hashed.slice(32, 64));
}
