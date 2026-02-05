import { cn } from "@/lib/utils";
import { Favicon } from "@/components/common/favicon";
import type { VaultItem } from "@/lib/opvault";

interface ItemListEntryProps {
  item: VaultItem;
  selected: boolean;
  onClick: () => void;
}

export function ItemListEntry({ item, selected, onClick }: ItemListEntryProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        selected ? "bg-selected" : "hover:bg-field-bg"
      )}
    >
      <Favicon url={item.url} size={32} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{item.title}</div>
        {item.ainfo && (
          <div className="truncate text-xs text-muted">{item.ainfo}</div>
        )}
      </div>
    </button>
  );
}
