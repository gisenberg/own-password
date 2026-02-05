import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVaultStore } from "@/stores/vault-store";

export function UnlockScreen() {
  const { vaultName, unlock, error, status } = useVaultStore();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    await unlock(password);
  };

  const isUnlocking = status === "unlocking";

  return (
    <div className="flex h-screen items-center justify-center bg-field-bg">
      <div className="w-full max-w-sm rounded-lg border border-border bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">{vaultName}</h1>
            <p className="mt-2 text-sm text-muted">
              Enter your master password to unlock
            </p>
          </div>
          <Input
            type="password"
            placeholder="Master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={isUnlocking}
          />
          <Button type="submit" className="w-full" disabled={isUnlocking || !password}>
            {isUnlocking ? "Unlocking..." : "Unlock"}
          </Button>
          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
