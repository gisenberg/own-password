import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 h-9 border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
