import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  icon: LucideIcon;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

export function SidebarSection({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: SidebarSectionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-active text-sidebar-text-active"
          : "text-sidebar-text hover:bg-sidebar-hover"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      <span className="text-xs opacity-60">{count}</span>
    </button>
  );
}
