import type {
  OPVaultProfile,
  OPVaultRawItem,
  OPVaultFolder,
  ItemOverview,
  ItemDetail,
  FolderInfo,
  KeyPair,
  VaultItem,
} from "./types";
import { base64ToUint8Array } from "./utils";
import { deriveKeys, decryptOpdata01, decryptAndDeriveKeys, decryptItemKey } from "./crypto";
import { VaultLockedError, InvalidPasswordError } from "./errors";

export class OPVault {
  private profile: OPVaultProfile;
  private rawItems: Record<string, OPVaultRawItem>;
  private rawFolders: OPVaultFolder;

  private masterKeys: KeyPair | null = null;
  private overviewKeys: KeyPair | null = null;
  private items: VaultItem[] = [];
  private folders: FolderInfo[] = [];

  constructor(
    profile: OPVaultProfile,
    rawItems: Record<string, OPVaultRawItem>,
    folders: OPVaultFolder
  ) {
    this.profile = profile;
    this.rawItems = rawItems;
    this.rawFolders = folders;
  }

  get name(): string {
    return this.profile.profileName;
  }

  get isLocked(): boolean {
    return this.masterKeys === null;
  }

  async unlock(password: string): Promise<boolean> {
    const salt = base64ToUint8Array(this.profile.salt);

    // Derive keys from password
    const derivedKeys = await deriveKeys(
      password,
      salt,
      this.profile.iterations
    );

    // Decrypt master and overview keys
    try {
      const masterKeyBlob = base64ToUint8Array(this.profile.masterKey);
      this.masterKeys = await decryptAndDeriveKeys(
        masterKeyBlob,
        derivedKeys.encKey,
        derivedKeys.macKey
      );

      const overviewKeyBlob = base64ToUint8Array(this.profile.overviewKey);
      this.overviewKeys = await decryptAndDeriveKeys(
        overviewKeyBlob,
        derivedKeys.encKey,
        derivedKeys.macKey
      );
    } catch (e) {
      this.masterKeys = null;
      this.overviewKeys = null;
      if (e instanceof InvalidPasswordError) {
        throw e;
      }
      throw new InvalidPasswordError();
    }

    // Decrypt all overviews
    await this.loadOverviews();
    await this.loadFolders();

    return true;
  }

  lock(): void {
    this.masterKeys = null;
    this.overviewKeys = null;
    this.items = [];
    this.folders = [];
  }

  private async loadOverviews(): Promise<void> {
    if (!this.overviewKeys) throw new VaultLockedError();

    const results: VaultItem[] = [];

    for (const [uuid, raw] of Object.entries(this.rawItems)) {
      try {
        const overviewData = base64ToUint8Array(raw.o);
        const decrypted = await decryptOpdata01(
          overviewData,
          this.overviewKeys.encKey,
          this.overviewKeys.macKey
        );
        const overview = JSON.parse(new TextDecoder().decode(decrypted));

        results.push({
          uuid,
          category: raw.category,
          title: overview.title || "Untitled",
          url: overview.url,
          ainfo: overview.ainfo,
          tags: overview.tags,
          fave: raw.fave,
          folder: raw.folder,
          trashed: raw.trashed,
          created: raw.created,
          updated: raw.updated,
          raw,
        });
      } catch {
        // Skip items that fail to decrypt
      }
    }

    this.items = results.sort((a, b) => a.title.localeCompare(b.title));
  }

  private async loadFolders(): Promise<void> {
    if (!this.overviewKeys) throw new VaultLockedError();

    const results: FolderInfo[] = [];

    for (const [uuid, folder] of Object.entries(this.rawFolders)) {
      try {
        const overviewData = base64ToUint8Array(folder.overview);
        const decrypted = await decryptOpdata01(
          overviewData,
          this.overviewKeys.encKey,
          this.overviewKeys.macKey
        );
        const overview = JSON.parse(new TextDecoder().decode(decrypted));

        results.push({
          uuid,
          title: overview.title || "Untitled",
          smart: folder.smart ?? false,
          created: folder.created,
          updated: folder.updated,
        });
      } catch {
        // Skip folders that fail to decrypt
      }
    }

    this.folders = results.sort((a, b) => a.title.localeCompare(b.title));
  }

  getItems(): VaultItem[] {
    return this.items;
  }

  getFolders(): FolderInfo[] {
    return this.folders;
  }

  async getItemDetail(uuid: string): Promise<ItemDetail> {
    if (!this.masterKeys) throw new VaultLockedError();

    const raw = this.rawItems[uuid];
    if (!raw) {
      throw new Error(`Item not found: ${uuid}`);
    }

    // Decrypt item key
    const itemKeys = await decryptItemKey(
      raw.k,
      this.masterKeys.encKey,
      this.masterKeys.macKey
    );

    // Decrypt item detail
    const detailData = base64ToUint8Array(raw.d);
    const decrypted = await decryptOpdata01(
      detailData,
      itemKeys.encKey,
      itemKeys.macKey
    );
    const detail: ItemDetail = JSON.parse(new TextDecoder().decode(decrypted));
    detail.uuid = uuid;

    return detail;
  }
}
