import { Lock, Star, Globe, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarSection } from "./sidebar-section";
import { useVaultStore } from "@/stores/vault-store";
import { useUIStore, type SidebarSection as SidebarSectionType } from "@/stores/ui-store";

export function Sidebar() {
  const { vaultName, lock, items } = useVaultStore();
  const { sidebarSection, setSidebarSection } = useUIStore();

  const allCount = items.filter((i) => !i.trashed).length;
  const favCount = items.filter((i) => !i.trashed && i.fave).length;
  const loginCount = items.filter(
    (i) => !i.trashed && i.category === "001"
  ).length;

  const sections: {
    id: SidebarSectionType;
    icon: typeof LayoutList;
    label: string;
    count: number;
  }[] = [
    { id: "all", icon: LayoutList, label: "All Items", count: allCount },
    { id: "favorites", icon: Star, label: "Favorites", count: favCount },
    { id: "logins", icon: Globe, label: "Logins", count: loginCount },
  ];

  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col bg-sidebar text-white">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-semibold truncate">{vaultName}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-text hover:text-white hover:bg-sidebar-hover"
          onClick={lock}
          aria-label="Lock vault"
        >
          <Lock className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex flex-col gap-0.5 px-2 pt-2">
        {sections.map((section) => (
          <SidebarSection
            key={section.id}
            icon={section.icon}
            label={section.label}
            count={section.count}
            active={sidebarSection === section.id}
            onClick={() => setSidebarSection(section.id)}
          />
        ))}
      </nav>
    </div>
  );
}
