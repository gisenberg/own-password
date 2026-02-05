import { CopyButton } from "@/components/common/copy-button";

interface FieldRowProps {
  label: string;
  value: string;
}

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="group flex items-start justify-between gap-2 px-6 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </div>
        <div className="mt-0.5 break-all text-sm">{value}</div>
      </div>
      <CopyButton
        value={value}
        className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </div>
  );
}
