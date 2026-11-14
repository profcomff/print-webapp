import { test, expect } from "@playwright/test";

test("print and history tabs are visible above the form in a clipped iframe", async ({
  page,
}) => {
  await page.route("**/top-navigation-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden}header{height:64px}main{height:calc(100% - 120px);overflow:hidden}iframe{height:100vh;width:100%;border:0}footer{height:56px}</style><header>Твой ФФ</header><main><iframe title="Принтер" src="/?embedded=true"></iframe></main><footer>Меню Твой ФФ</footer>`,
    }),
  );
  await page.goto("/top-navigation-fixture");
  const frame = page.frameLocator("iframe");
  const navigation = frame.getByRole("navigation", { name: "Разделы печати" });
  await expect(navigation).toBeVisible();
  const area = await page.locator("main").boundingBox();
  const menu = await navigation.boundingBox();
  const form = await frame.locator("form").boundingBox();
  expect(menu!.y).toBeGreaterThanOrEqual(area!.y);
  expect(menu!.y + menu!.height).toBeLessThanOrEqual(area!.y + area!.height);
  expect(menu!.y + menu!.height).toBeLessThanOrEqual(form!.y);
  for (const text of [
    "Всё начинается с файла",
    "Что распечатаем?",
    "Загрузите PDF, а затем заберите распечатку у принтера.",
  ]) {
    await expect(frame.getByText(text, { exact: true })).toHaveCount(0);
  }
  await navigation.getByRole("link", { name: "История", exact: true }).click();
  await expect(
    frame.getByRole("heading", { name: "Ваши документы" }),
  ).toBeVisible();
  await navigation.getByRole("link", { name: "Печать", exact: true }).click();
  await expect(
    frame.getByRole("button", { name: "Загрузить для печати" }),
  ).toBeVisible();
});
