import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "Own Password",
    description: "Read-only 1Password OPVault viewer",
  },
});
