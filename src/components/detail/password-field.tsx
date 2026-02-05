import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/copy-button";
import { useUIStore } from "@/stores/ui-store";

interface PasswordFieldProps {
  label: string;
  value: string;
  fieldId: string;
}

export function PasswordField({ label, value, fieldId }: PasswordFieldProps) {
  const { showPassword, togglePasswordVisibility } = useUIStore();
  const isVisible = showPassword[fieldId] ?? false;

  return (
    <div className="group flex items-start justify-between gap-2 px-6 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </div>
        <div className="mt-0.5 text-sm">
          {isVisible ? (
            <span className="break-all font-mono">{value}</span>
          ) : (
            <span className="tracking-widest">{"•".repeat(Math.min(value.length, 20))}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => togglePasswordVisibility(fieldId)}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4 text-muted" />
          ) : (
            <Eye className="h-4 w-4 text-muted" />
          )}
        </Button>
        <CopyButton
          value={value}
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </div>
  );
}
