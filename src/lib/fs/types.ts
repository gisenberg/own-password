export interface VaultDirectoryReader {
  readFile(relativePath: string): Promise<string>;
  hasFile(relativePath: string): Promise<boolean>;
  readonly name: string;
}
