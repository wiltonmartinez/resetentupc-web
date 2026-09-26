import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://resetentupc.com",
  trailingSlash: "ignore",
  adapter: cloudflare()
});