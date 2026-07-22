import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

const explicitSiteUrl = process.env.SITE_URL?.trim();
const explicitBasePath = process.env.PUBLIC_BASE_PATH?.trim();
const [repositoryOwner, repositoryName] = (
  process.env.GITHUB_REPOSITORY ?? "/"
).split("/");
const isUserOrOrganizationSite =
  repositoryName?.toLowerCase() ===
  `${repositoryOwner?.toLowerCase()}.github.io`;
const site =
  explicitSiteUrl ||
  (repositoryOwner
    ? `https://${repositoryOwner.toLowerCase()}.github.io`
    : "https://graphroots.example");
const requestedBase =
  explicitBasePath ||
  (explicitSiteUrl || !repositoryName || isUserOrOrganizationSite
    ? "/"
    : `/${repositoryName}`);
const base =
  requestedBase === "/" ? "/" : `/${requestedBase.replace(/^\/+|\/+$/g, "")}`;

export default defineConfig({
  integrations: [svelte()],
  output: "static",
  site,
  base,
});
