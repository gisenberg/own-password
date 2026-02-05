import { Key } from "lucide-react";

interface FaviconProps {
  url?: string;
  size?: number;
  className?: string;
}

export function Favicon({ url, size = 32, className }: FaviconProps) {
  if (!url) {
    return (
      <div
        className={`flex items-center justify-center rounded bg-field-bg ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        <Key className="h-4 w-4 text-muted" />
      </div>
    );
  }

  let domain: string;
  try {
    domain = new URL(url).hostname;
  } catch {
    return (
      <div
        className={`flex items-center justify-center rounded bg-field-bg ${className ?? ""}`}
        style={{ width: size, height: size }}
      >
        <Key className="h-4 w-4 text-muted" />
      </div>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`}
      alt=""
      width={size}
      height={size}
      className={`rounded ${className ?? ""}`}
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
        target.parentElement?.classList.add(
          "flex",
          "items-center",
          "justify-center",
          "rounded",
          "bg-field-bg"
        );
      }}
    />
  );
}
