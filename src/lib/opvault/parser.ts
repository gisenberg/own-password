import type { OPVaultProfile, OPVaultRawItem, OPVaultFolder } from "./types";

export function parseProfile(content: string): OPVaultProfile {
  // Format: var profile=<JSON>;
  const json = content.replace(/^var profile=/, "").replace(/;$/, "").trim();
  return JSON.parse(json);
}

export function parseFolders(content: string): OPVaultFolder {
  // Format: loadFolders(<JSON>);
  const json = content.replace(/^loadFolders\(/, "").replace(/\);$/, "").trim();
  return JSON.parse(json);
}

export function parseBandFile(
  content: string
): Record<string, OPVaultRawItem> {
  // Format: ld(<JSON>);
  const json = content.replace(/^ld\(/, "").replace(/\);$/, "").trim();
  return JSON.parse(json);
}
