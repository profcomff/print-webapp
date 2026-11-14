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

test("cross-origin clipped iframe keeps navigation inside the visible host area", async ({
  page,
}) => {
  // Real mini-apps and their host have different origins. Fulfill locally to avoid
  // Chromium's loopback-network permission prompt in the synthetic host page.
  await page.route("http://127.0.0.1:9004/**", async (route) => {
    await route.fulfill({ response: await route.fetch() });
  });
  await page.route("http://localhost:9004/clipped-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden}header{height:64px}main{height:calc(100% - 120px);overflow:hidden}iframe{height:100vh;width:100%;border:0}footer{height:56px}</style><header>Твой ФФ</header><main><iframe title="Принтер" src="http://127.0.0.1:9004/"></iframe></main><footer>Меню Твой ФФ</footer>`,
    }),
  );
  await page.goto("http://localhost:9004/clipped-fixture");
  const child = page.frameLocator("iframe");
  const nav = child.getByRole("navigation", { name: "Разделы печати" });
  await expect(nav).toBeVisible();
  const assertVisibleMenu = async () => {
    await expect
      .poll(async () => {
        const navBox = await nav.boundingBox();
        const area = await page.locator("main").boundingBox();
        return (
          !!navBox &&
          !!area &&
          navBox.y >= area.y &&
          navBox.y + navBox.height <= area.y + area.height + 1
        );
      })
      .toBe(true);
  };
  await assertVisibleMenu();
  await child.locator(".app-content").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await assertVisibleMenu();
  await nav.getByRole("link", { name: "История", exact: true }).click();
  await expect(
    child.getByRole("heading", { name: "Ваши документы" }),
  ).toBeVisible();
  await page.locator("main").evaluate((el) => {
    el.style.height = "300px";
  });
  await assertVisibleMenu();
  await page.setViewportSize({ width: 412, height: 700 });
  await assertVisibleMenu();
  // Rotation can preserve the visible ratio while changing the pixel height.
  await page.locator("main").evaluate((el) => {
    el.style.height = "60vh";
  });
  await assertVisibleMenu();
  await page.setViewportSize({ width: 412, height: 500 });
  await assertVisibleMenu();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("main").evaluate((el) => {
    el.style.height = "300px";
    el.style.overflow = "auto";
  });
  await assertVisibleMenu();
  // Host scrolling can move the visible slice without changing its area ratio.
  await page.locator("main").evaluate((el) => {
    el.scrollTop = 350;
  });
  await assertVisibleMenu();
  await page.locator("main").evaluate((el) => {
    el.scrollTop = 0;
  });
  await assertVisibleMenu();
});
