import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchBar } from "./search-bar";
import { ItemListEntry } from "./item-list-entry";
import { useVaultStore } from "@/stores/vault-store";
import { useUIStore } from "@/stores/ui-store";

export function ItemList() {
  const { items, selectedItemUuid, selectItem } = useVaultStore();
  const { searchQuery, sidebarSection } = useUIStore();

  const filteredItems = useMemo(() => {
    let filtered = items.filter((i) => !i.trashed);

    // Filter by sidebar section
    if (sidebarSection === "favorites") {
      filtered = filtered.filter((i) => i.fave);
    } else if (sidebarSection === "logins") {
      filtered = filtered.filter((i) => i.category === "001");
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.url?.toLowerCase().includes(q) ||
          i.ainfo?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [items, searchQuery, sidebarSection]);

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-r border-border">
      <SearchBar />
      <ScrollArea className="flex-1">
        {filteredItems.map((item) => (
          <ItemListEntry
            key={item.uuid}
            item={item}
            selected={selectedItemUuid === item.uuid}
            onClick={() => selectItem(item.uuid)}
          />
        ))}
      </ScrollArea>
      <div className="border-t border-border px-4 py-2 text-xs text-muted">
        {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
