import { useVaultStore } from "@/stores/vault-store";
import { VaultPicker } from "@/components/unlock/vault-picker";
import { UnlockScreen } from "@/components/unlock/unlock-screen";
import { VaultLayout } from "@/components/layout/vault-layout";
import { Loader2 } from "lucide-react";

export function App() {
  const { status } = useVaultStore();

  switch (status) {
    case "idle":
      return <VaultPicker />;

    case "loading":
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );

    case "locked":
    case "unlocking":
      return <UnlockScreen />;

    case "unlocked":
      return <VaultLayout />;
  }
}
