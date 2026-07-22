import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const outputDirectory = fileURLToPath(new URL("../dist/", import.meta.url));

function deploymentBasePath(): string {
  const explicitSiteUrl = process.env.SITE_URL?.trim();
  const explicitBasePath = process.env.PUBLIC_BASE_PATH?.trim();
  const [repositoryOwner, repositoryName] = (
    process.env.GITHUB_REPOSITORY ?? "/"
  ).split("/");
  const isUserOrOrganizationSite =
    repositoryName?.toLowerCase() ===
    `${repositoryOwner?.toLowerCase()}.github.io`;
  const basePath =
    explicitBasePath ||
    (explicitSiteUrl || !repositoryName || isUserOrOrganizationSite
      ? "/"
      : `/${repositoryName}`);

  return basePath === "/" ? "/" : `/${basePath.replace(/^\/+|\/+$/g, "")}`;
}

async function collectHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(path)));
    } else if (entry.name.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
}

const basePath = deploymentBasePath();
const requiredFiles = [
  ".nojekyll",
  "404.html",
  "index.html",
  "robots.txt",
  "sitemap.xml",
  "data/generated/graphroots-blues-graph.json",
];
const missingFiles: string[] = [];

for (const file of requiredFiles) {
  try {
    await readFile(join(outputDirectory, file));
  } catch {
    missingFiles.push(file);
  }
}

const invalidReferences: string[] = [];
const htmlFiles = await collectHtmlFiles(outputDirectory);
const rootReferencePattern = /\b(?:action|href|src)=["'](\/(?!\/)[^"']*)["']/g;

if (basePath !== "/") {
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    for (const match of html.matchAll(rootReferencePattern)) {
      const reference = match[1];
      if (!reference) continue;
      if (reference !== basePath && !reference.startsWith(`${basePath}/`)) {
        invalidReferences.push(
          `${relative(outputDirectory, file)}: ${reference}`,
        );
      }
    }
  }
}

const sitemap = await readFile(join(outputDirectory, "sitemap.xml"), "utf8");
const robots = await readFile(join(outputDirectory, "robots.txt"), "utf8");
const expectedSitemapPath =
  basePath === "/" ? "/sitemap.xml" : `${basePath}/sitemap.xml`;

if (!robots.includes(expectedSitemapPath)) {
  invalidReferences.push(`robots.txt: missing ${expectedSitemapPath}`);
}
if (basePath !== "/" && !sitemap.includes(`${basePath}/`)) {
  invalidReferences.push(`sitemap.xml: missing ${basePath}/ URLs`);
}

if (missingFiles.length > 0 || invalidReferences.length > 0) {
  const details = [
    ...missingFiles.map((file) => `Missing build artifact: ${file}`),
    ...invalidReferences.map(
      (reference) => `Invalid build reference: ${reference}`,
    ),
  ];
  throw new Error(`Built-site validation failed:\n${details.join("\n")}`);
}

console.log(
  `Built-site validation passed for ${htmlFiles.length} HTML files at base ${basePath}.`,
);
