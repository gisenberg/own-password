import type { VaultDirectoryReader } from "./types";

export class FSAccessDirectoryReader implements VaultDirectoryReader {
  private handle: FileSystemDirectoryHandle;

  constructor(handle: FileSystemDirectoryHandle) {
    this.handle = handle;
  }

  get name(): string {
    return this.handle.name;
  }

  async readFile(relativePath: string): Promise<string> {
    const segments = relativePath.split("/").filter(Boolean);
    let current: FileSystemDirectoryHandle = this.handle;

    // Walk directory segments
    for (let i = 0; i < segments.length - 1; i++) {
      current = await current.getDirectoryHandle(segments[i]);
    }

    const fileName = segments[segments.length - 1];
    const fileHandle = await current.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return file.text();
  }

  async hasFile(relativePath: string): Promise<boolean> {
    try {
      const segments = relativePath.split("/").filter(Boolean);
      let current: FileSystemDirectoryHandle = this.handle;

      for (let i = 0; i < segments.length - 1; i++) {
        current = await current.getDirectoryHandle(segments[i]);
      }

      const fileName = segments[segments.length - 1];
      await current.getFileHandle(fileName);
      return true;
    } catch {
      return false;
    }
  }
}

export async function openVaultDirectory(): Promise<FSAccessDirectoryReader | null> {
  try {
    const handle = await window.showDirectoryPicker();
    return new FSAccessDirectoryReader(handle);
  } catch {
    // User cancelled
    return null;
  }
}
