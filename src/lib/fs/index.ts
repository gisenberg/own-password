import { OPVault, parseProfile, parseFolders, parseBandFile } from "@/lib/opvault";
import type { OPVaultRawItem } from "@/lib/opvault";
import type { VaultDirectoryReader } from "./types";

export { FSAccessDirectoryReader, openVaultDirectory } from "./directory-reader";
export type { VaultDirectoryReader } from "./types";

const BAND_HEX = "0123456789ABCDEF";

export async function loadVaultFromDirectory(
  reader: VaultDirectoryReader
): Promise<OPVault> {
  // OPVault structure: <name>.opvault/default/
  // macOS treats .opvault as a package bundle, so the user may need to
  // select the "default" folder directly instead of the .opvault root.
  // Detect which case we're in by checking for profile.js at both levels.
  const hasDefault = await reader.hasFile("default/profile.js");
  const prefix = hasDefault ? "default/" : "";

  const profileContent = await reader.readFile(`${prefix}profile.js`);
  const profile = parseProfile(profileContent);

  // Load folders
  let folders = {};
  if (await reader.hasFile(`${prefix}folders.js`)) {
    const foldersContent = await reader.readFile(`${prefix}folders.js`);
    folders = parseFolders(foldersContent);
  }

  // Load all band files (band_0.js through band_F.js)
  const allItems: Record<string, OPVaultRawItem> = {};

  for (const hex of BAND_HEX) {
    const bandPath = `${prefix}band_${hex}.js`;
    if (await reader.hasFile(bandPath)) {
      const bandContent = await reader.readFile(bandPath);
      const items = parseBandFile(bandContent);
      Object.assign(allItems, items);
    }
  }

  return new OPVault(profile, allItems, folders);
}
