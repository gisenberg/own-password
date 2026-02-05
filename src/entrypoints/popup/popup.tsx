import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Popup() {
  const openVaultViewer = () => {
    browser.tabs.create({
      url: browser.runtime.getURL("/vault.html"),
    });
    window.close();
  };

  return (
    <div className="w-[280px] p-4">
      <div className="flex flex-col items-center gap-3">
        <Key className="h-8 w-8 text-primary" />
        <h1 className="text-base font-semibold">Own Password</h1>
        <Button onClick={openVaultViewer} className="w-full">
          Open Vault Viewer
        </Button>
      </div>
    </div>
  );
}
