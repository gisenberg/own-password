import { Sidebar } from "@/components/sidebar/sidebar";
import { ItemList } from "@/components/item-list/item-list";
import { ItemDetail } from "@/components/detail/item-detail";

export function VaultLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ItemList />
      <ItemDetail />
    </div>
  );
}
