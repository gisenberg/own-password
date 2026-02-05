import { ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/common/copy-button";

interface UrlFieldProps {
  label: string;
  value: string;
}

export function UrlField({ label, value }: UrlFieldProps) {
  return (
    <div className="group flex items-start justify-between gap-2 px-6 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </div>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <span className="break-all">{value}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      </div>
      <CopyButton
        value={value}
        className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </div>
  );
}
