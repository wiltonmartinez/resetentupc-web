import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://resetenlinea.com",
  trailingSlash: "ignore",
  adapter: cloudflare()
});