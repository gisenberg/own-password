import { useState, useCallback } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVaultStore } from "@/stores/vault-store";

export function VaultPicker() {
  const { loadVault, loadVaultFromHandle, error } = useVaultStore();
  const [dragging, setDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);

      const item = e.dataTransfer.items[0];
      if (!item) return;

      // getAsFileSystemHandle is available in Chromium browsers
      const handle = await item.getAsFileSystemHandle();
      if (handle?.kind === "directory") {
        loadVaultFromHandle(handle as FileSystemDirectoryHandle);
      }
    },
    [loadVaultFromHandle]
  );

  return (
    <div
      className="flex h-screen items-center justify-center bg-field-bg"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm ${
          dragging ? "border-primary border-2" : "border-border"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">Own Password</h1>
            <p className="mt-2 text-sm text-muted">
              {dragging
                ? "Drop your OPVault folder here"
                : "Open a 1Password OPVault to view your items"}
            </p>
          </div>
          <Button onClick={loadVault} className="w-full">
            Open Vault
          </Button>
          <p className="text-xs text-muted">
            or drag and drop an .opvault folder here
          </p>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
