import { create } from "zustand";
import type { OPVault } from "@/lib/opvault";
import type { VaultItem, ItemDetail, FolderInfo } from "@/lib/opvault";
import { InvalidPasswordError } from "@/lib/opvault";
import {
  FSAccessDirectoryReader,
  openVaultDirectory,
  loadVaultFromDirectory,
} from "@/lib/fs";

export type VaultStatus =
  | "idle"
  | "loading"
  | "locked"
  | "unlocking"
  | "unlocked";

interface VaultState {
  status: VaultStatus;
  error: string | null;
  vaultName: string | null;
  items: VaultItem[];
  folders: FolderInfo[];
  selectedItemUuid: string | null;
  selectedItemDetail: ItemDetail | null;
  decryptingDetail: boolean;

  loadVault: () => Promise<void>;
  loadVaultFromHandle: (handle: FileSystemDirectoryHandle) => Promise<void>;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
  selectItem: (uuid: string) => Promise<void>;
  clearSelection: () => void;
}

// Module-level ref for OPVault instance (CryptoKey objects are not serializable)
let vaultInstance: OPVault | null = null;

export const useVaultStore = create<VaultState>((set, get) => ({
  status: "idle",
  error: null,
  vaultName: null,
  items: [],
  folders: [],
  selectedItemUuid: null,
  selectedItemDetail: null,
  decryptingDetail: false,

  loadVault: async () => {
    try {
      const reader = await openVaultDirectory();
      if (!reader) return; // User cancelled

      set({ status: "loading", error: null });

      const vault = await loadVaultFromDirectory(reader);
      vaultInstance = vault;

      set({
        status: "locked",
        vaultName: vault.name,
      });
    } catch (e) {
      set({
        status: "idle",
        error: e instanceof Error ? e.message : "Failed to load vault",
      });
    }
  },

  loadVaultFromHandle: async (handle: FileSystemDirectoryHandle) => {
    try {
      set({ status: "loading", error: null });

      const reader = new FSAccessDirectoryReader(handle);
      const vault = await loadVaultFromDirectory(reader);
      vaultInstance = vault;

      set({
        status: "locked",
        vaultName: vault.name,
      });
    } catch (e) {
      set({
        status: "idle",
        error: e instanceof Error ? e.message : "Failed to load vault",
      });
    }
  },

  unlock: async (password: string) => {
    if (!vaultInstance) return;

    set({ status: "unlocking", error: null });

    try {
      await vaultInstance.unlock(password);

      set({
        status: "unlocked",
        items: vaultInstance.getItems(),
        folders: vaultInstance.getFolders(),
      });
    } catch (e) {
      set({
        status: "locked",
        error:
          e instanceof InvalidPasswordError
            ? "Incorrect master password"
            : e instanceof Error
              ? e.message
              : "Failed to unlock vault",
      });
    }
  },

  lock: () => {
    if (vaultInstance) {
      vaultInstance.lock();
    }
    set({
      status: "locked",
      items: [],
      folders: [],
      selectedItemUuid: null,
      selectedItemDetail: null,
      error: null,
    });
  },

  selectItem: async (uuid: string) => {
    if (!vaultInstance) return;

    set({
      selectedItemUuid: uuid,
      selectedItemDetail: null,
      decryptingDetail: true,
    });

    try {
      const detail = await vaultInstance.getItemDetail(uuid);
      // Only set if still selected (user may have clicked another item)
      if (get().selectedItemUuid === uuid) {
        set({ selectedItemDetail: detail, decryptingDetail: false });
      }
    } catch (e) {
      if (get().selectedItemUuid === uuid) {
        set({
          decryptingDetail: false,
          error: e instanceof Error ? e.message : "Failed to decrypt item",
        });
      }
    }
  },

  clearSelection: () => {
    set({
      selectedItemUuid: null,
      selectedItemDetail: null,
      decryptingDetail: false,
    });
  },
}));
