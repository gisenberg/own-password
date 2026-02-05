export class OPVaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OPVaultError";
  }
}

export class InvalidPasswordError extends OPVaultError {
  constructor() {
    super("Invalid master password");
    this.name = "InvalidPasswordError";
  }
}

export class CorruptedDataError extends OPVaultError {
  constructor(detail: string) {
    super(`Corrupted vault data: ${detail}`);
    this.name = "CorruptedDataError";
  }
}

export class VaultLockedError extends OPVaultError {
  constructor() {
    super("Vault is locked");
    this.name = "VaultLockedError";
  }
}
