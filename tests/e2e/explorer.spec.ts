import { expect, test } from "@playwright/test";
import { prefixBasePath } from "../../src/domain/base-path";

const basePath = process.env.PUBLIC_BASE_PATH ?? "/";
const appPath = (path: string) => prefixBasePath(path, basePath);

test("homepage and evidence routes are statically useful", async ({ page }) => {
  const clientErrors: Error[] = [];
  page.on("pageerror", (error) => clientErrors.push(error));

  await page.goto(appPath("/"));
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "About" }),
  ).toHaveAttribute("href", appPath("/about"));
  await expect(page.locator("footer")).toContainText(
    "Copyright © 2026 Elkaïoum M. Moutuou.",
  );
  await expect(
    page.locator("footer").getByRole("link", { name: "MIT License" }),
  ).toHaveAttribute("href", appPath("/legal/license"));
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "roots and branches of the blues",
  );
  await expect(page.locator(".network-feature .graph-node")).toHaveCount(296);
  await expect(page.locator(".network-feature .graph-edge")).toHaveCount(1196);
  await expect(
    page.locator(".network-feature .graph-edge.is-provisional"),
  ).toHaveCount(1153);
  await expect(
    page.locator(".network-feature .graph-edge.is-provisional[marker-end]"),
  ).toHaveCount(14);
  await expect(
    page.locator(".network-feature .graph-edge[marker-end]"),
  ).toHaveCount(44);
  await page
    .locator(".network-feature")
    .getByRole("button", { name: "Show reviewed only" })
    .click();
  await expect(page.locator(".network-feature .graph-edge")).toHaveCount(43);
  await expect(
    page.locator(".network-feature .graph-edge.is-provisional"),
  ).toHaveCount(0);

  await page.getByLabel("Search Blues artists").fill("Muddy Waters");
  await page
    .locator(".site-search")
    .getByRole("button", { name: "Search" })
    .click();
  await expect(page).toHaveURL(/\/blues\/explore\?query=Muddy\+Waters/);
  await expect(
    page.getByRole("heading", { name: "Muddy Waters" }),
  ).toBeVisible();

  await page.goto(appPath("/artists/christone-kingfish-ingram"));
  await expect(
    page.getByRole("link", { name: "Focus in explorer" }),
  ).toHaveAttribute(
    "href",
    appPath("/blues/explore?entity=christone-kingfish-ingram"),
  );
  await expect(page.getByTitle(/Christone.*Kingfish.*— 662/)).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/QdC99sQRd1s/,
  );

  await page.goto(appPath("/artists/willie-big-eyes-smith"));
  await expect(
    page.getByTitle(/Willie.*Big Eyes.*— Hoodoo Man Blues/),
  ).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/2cJ7krFYflY/);

  await page.goto(appPath("/artists/ry-cooder"));
  await expect(page.getByTitle(/Ry Cooder — The Prodigal Son/)).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/HEUIZWyieAk/,
  );

  await page.goto(appPath("/artists/rory-block"));
  await expect(
    page.getByTitle(/Rory Block — Cried Like A Baby/),
  ).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/oVMHmGe69KI/);
  expect(await page.locator("main article h2").allTextContents()).toEqual([
    "Profile",
    "Featured song",
    "Relationships",
    "Sources",
  ]);
  await expect(page.getByText("5 shown · 5 cited")).toBeVisible();
  await expect(page.getByText("Provisional", { exact: true })).toHaveCount(5);
  await expect(
    page.getByRole("link", { name: "Robert Johnson" }),
  ).toHaveAttribute("href", appPath("/artists/robert-johnson"));
  await expect(page.getByText(/relationships are withheld/i)).toHaveCount(0);

  await page.goto(appPath("/blues/explore?entity=arthur-big-boy-spires"));
  const willieSmithPath = page.locator(".neighbourhood li").filter({
    hasText: 'Willie "Big Eyes" Smith',
  });
  await expect(willieSmithPath).toBeVisible();
  await willieSmithPath.getByText("Why this path appears").click();
  await expect(
    willieSmithPath.getByText(/Wikipedia biography explicitly connects/),
  ).toBeVisible();

  await page.goto(appPath("/artists/john-mayer"));
  await expect(page.getByTitle(/John Mayer — Wild Blue/)).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/EUwynJ-WHGo/,
  );

  await page.goto(appPath("/artists/magic-sam"));
  await expect(page.getByTitle(/Magic Sam — All Of Your Love/)).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/SvzPNBDt7Eo/,
  );
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();

  await page.goto(appPath("/ensembles/gare-du-nord"));
  await expect(page.getByTitle(/Gare du Nord — Pablo's Blues/)).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/XrqDr2c-yxU/,
  );

  await page.goto(appPath("/artists/blind-willie-johnson"));
  await expect(
    page.getByTitle(/Blind Willie Johnson — Dark Was the Night/),
  ).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/ud74hhPqISo/);

  await page.goto(appPath("/artists/robert-johnson"));
  await expect(page.getByText(/migrated from the prototype/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Sources" })).toHaveCount(0);

  await page.goto(appPath("/sources"));
  await expect(page.getByText("Legacy development import")).toHaveCount(0);

  await page.goto(appPath("/relationships/robert-johnson--gare-du-nord"));
  await expect(
    page.getByRole("heading", { name: "Robert Johnson → Gare du Nord" }),
  ).toBeVisible();
  await expect(
    page.getByText("Entity B covered a work by entity A."),
  ).toBeVisible();

  await page.goto(appPath("/relationships/bb-king--christone-kingfish-ingram"));
  await expect(
    page.getByRole("heading", {
      name: "B.B. King → Christone “Kingfish” Ingram",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Citations" })).toBeVisible();

  await page.goto(appPath("/methodology"));
  await expect(
    page.getByRole("heading", { name: "Every arrow is a claim." }),
  ).toBeVisible();
  await expect(
    page.getByText(/The absence of an edge means only/),
  ).toBeVisible();

  await page.goto(appPath("/about"));
  await expect(
    page.getByRole("heading", { name: "Why begin with the blues?" }),
  ).toBeVisible();
  await expect(page.getByText(/not a complete genealogy/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Methodology page" }),
  ).toHaveAttribute("href", appPath("/methodology"));
  await expect(
    page.getByRole("link", { name: "Open a corpus correction issue" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/elkMm/GraphRoots/issues/new?template=corpus-correction.yml",
  );

  await page.goto(appPath("/legal/license"));
  await expect(
    page.getByRole("heading", { name: "MIT License" }),
  ).toBeVisible();
  await expect(page.locator("pre")).toContainText(
    "Copyright (c) 2026 Elkaïoum M. Moutuou",
  );
  expect(clientErrors).toEqual([]);
});

test("explorer supports search, filters, reset, and keyboard selection", async ({
  page,
}) => {
  await page.goto(appPath("/blues/explore"));
  const nodes = page.locator(".graph-node");
  const edges = page.locator(".graph-edge");
  await expect(nodes).toHaveCount(296);
  await expect(edges).toHaveCount(1196);
  await expect(page.locator(".graph-edge[marker-end]")).toHaveCount(44);
  await page.getByRole("button", { name: "Show reviewed only" }).click();
  await expect(edges).toHaveCount(43);
  await page.getByRole("button", { name: "Show exploratory paths" }).click();
  await expect(edges).toHaveCount(1196);
  await expect(page.locator(".graph-edge[marker-end]")).toHaveCount(44);

  await page.getByLabel("Search an artist or tradition").fill("Muddy Waters");
  await page.getByRole("button", { name: "Focus" }).click();
  await expect(
    page.getByRole("heading", { name: "Muddy Waters" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/entity=muddy-waters/);

  await page.getByLabel("Entity type").selectOption("tradition");
  await expect(nodes).toHaveCount(6);

  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(nodes).toHaveCount(296);
  await expect(edges).toHaveCount(1196);

  await nodes.first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".detail-panel")).toBeVisible();
});

test("explorer remains usable at a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appPath("/blues/explore?entity=kora-ngoni"));
  await expect(page.locator(".graph-node")).toHaveCount(296);
  await expect(
    page.getByRole("heading", { name: "Kora & Ngoni String Traditions" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".detail-panel small")
      .filter({ hasText: "Interpretive or debated" }),
  ).toBeVisible();
});
