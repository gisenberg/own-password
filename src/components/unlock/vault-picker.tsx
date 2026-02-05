import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVaultStore } from "@/stores/vault-store";

export function VaultPicker() {
  const { loadVault, error } = useVaultStore();

  return (
    <div className="flex h-screen items-center justify-center bg-field-bg">
      <div className="w-full max-w-sm rounded-lg border border-border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">Own Password</h1>
            <p className="mt-2 text-sm text-muted">
              Open a 1Password OPVault to view your items
            </p>
          </div>
          <Button onClick={loadVault} className="w-full">
            Open Vault
          </Button>
          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
