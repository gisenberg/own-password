export interface OPVaultProfile {
  uuid: string;
  profileName: string;
  salt: string; // base64
  masterKey: string; // base64 opdata01
  overviewKey: string; // base64 opdata01
  iterations: number;
  createdAt: number;
  updatedAt: number;
  lastUpdatedBy: string;
}

export interface OPVaultRawItem {
  uuid: string;
  category: string;
  created: number;
  updated: number;
  d: string; // base64 opdata01 — encrypted detail
  hmac: string; // base64
  k: string; // base64 — encrypted item key
  o: string; // base64 opdata01 — encrypted overview
  tx: number;
  fave?: number;
  folder?: string;
  trashed?: boolean;
}

export interface ItemOverview {
  uuid: string;
  category: string;
  title: string;
  url?: string;
  ainfo?: string; // account info (usually username)
  tags?: string[];
  fave?: number;
  folder?: string;
  trashed?: boolean;
  created: number;
  updated: number;
}

export interface ItemDetail {
  uuid: string;
  fields?: ItemField[];
  sections?: ItemSection[];
  notesPlain?: string;
  htmlForm?: { htmlAction: string };
}

export interface ItemField {
  designation?: string;
  name: string;
  type: string;
  value: string;
}

export interface ItemSection {
  name: string;
  title: string;
  fields?: SectionField[];
}

export interface SectionField {
  k: string; // kind
  n: string; // name
  t: string; // title
  v: unknown; // value
}

export interface OPVaultFolder {
  [uuid: string]: {
    overview: string; // base64 opdata01
    tx: number;
    updated: number;
    created: number;
    smart?: boolean;
  };
}

export interface FolderInfo {
  uuid: string;
  title: string;
  smart: boolean;
  created: number;
  updated: number;
}

export interface KeyPair {
  encKey: CryptoKey;
  macKey: CryptoKey;
}

export interface VaultItem extends ItemOverview {
  raw: OPVaultRawItem;
}
