import { OPVault, parseProfile, parseFolders, parseBandFile } from "@/lib/opvault";
import type { OPVaultRawItem } from "@/lib/opvault";
import type { VaultDirectoryReader } from "./types";

export { FSAccessDirectoryReader, openVaultDirectory } from "./directory-reader";
export type { VaultDirectoryReader } from "./types";

const BAND_HEX = "0123456789ABCDEF";

export async function loadVaultFromDirectory(
  reader: VaultDirectoryReader
): Promise<OPVault> {
  // Find the default profile directory
  // OPVault structure: <name>.opvault/default/
  const profileContent = await reader.readFile("default/profile.js");
  const profile = parseProfile(profileContent);

  // Load folders
  let folders = {};
  if (await reader.hasFile("default/folders.js")) {
    const foldersContent = await reader.readFile("default/folders.js");
    folders = parseFolders(foldersContent);
  }

  // Load all band files (band_0.js through band_F.js)
  const allItems: Record<string, OPVaultRawItem> = {};

  for (const hex of BAND_HEX) {
    const bandPath = `default/band_${hex}.js`;
    if (await reader.hasFile(bandPath)) {
      const bandContent = await reader.readFile(bandPath);
      const items = parseBandFile(bandContent);
      Object.assign(allItems, items);
    }
  }

  return new OPVault(profile, allItems, folders);
}
