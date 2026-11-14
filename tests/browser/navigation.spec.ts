import { test, expect } from "@playwright/test";

test.use({
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
});

test("iframe scrolls its content without moving or covering navigation", async ({
  page,
}) => {
  await page.route("**/navigation-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden}body{display:flex;flex-direction:column}header,footer{flex:0 0 56px;background:#00004b;color:white}iframe{flex:1;min-height:0;width:100%;border:0}</style><header>Твой ФФ</header><iframe title="Принтер" src="/"></iframe><footer>Меню Твой ФФ</footer>`,
    }),
  );
  await page.addInitScript(() => {
    localStorage.setItem(
      "print-history",
      JSON.stringify(
        Array.from({ length: 10 }, (_, i) => ({
          pin: `PIN${i}`,
          name: `Документ ${i}.pdf`,
        })),
      ),
    );
  });
  await page.goto("/navigation-fixture");
  const frame = page.frameLocator("iframe");
  const nav = frame.getByRole("navigation", { name: "Разделы печати" });
  await expect(nav).toBeVisible();
  const child = page
    .frames()
    .find((frame) => new URL(frame.url()).pathname === "/");
  if (!child) throw new Error("Printer iframe did not load");
  // The iframe document must fit its viewport; scrolling it can hide fixed bars in WebViews.
  expect(
    await child.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  ).toBe(true);
  const content = frame.locator(".app-content");
  const assertMenu = async () => {
    const iframeBox = await page.locator("iframe").boundingBox();
    const navBox = await nav.boundingBox();
    expect(iframeBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(navBox!.y).toBeGreaterThanOrEqual(iframeBox!.y);
    expect(navBox!.y + navBox!.height).toBeLessThanOrEqual(
      iframeBox!.y + iframeBox!.height + 1,
    );
    expect(await child.evaluate(() => window.scrollY)).toBe(0);
    const center = await frame
      .getByRole("link", { name: "История", exact: true })
      .evaluate((link) => {
        const box = link.getBoundingClientRect();
        return link.contains(
          document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
          ),
        );
      });
    expect(center).toBe(true);
  };
  await assertMenu();
  await content.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect
    .poll(() => content.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await assertMenu();
  await content.evaluate((el) => {
    el.scrollTop = 0;
  });
  await assertMenu();
  await frame.getByRole("link", { name: "История", exact: true }).click();
  await expect(
    frame.getByRole("heading", { name: "Ваши документы" }),
  ).toBeVisible();
  await content.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await assertMenu();
  await nav.getByRole("link", { name: "Печать", exact: true }).click();
  await expect(
    frame.getByRole("heading", { name: "Что распечатаем?" }),
  ).toBeVisible();
  await expect.poll(() => content.evaluate((el) => el.scrollTop)).toBe(0);
  await page.setViewportSize({ width: 390, height: 420 });
  await assertMenu();
});
