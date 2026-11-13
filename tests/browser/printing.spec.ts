import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("upload, PIN, old history and embedded context survive navigation", async ({
  page,
}, testInfo) => {
  let reserves = 0,
    uploads = 0;
  await page.route("**/print/file", async (route) => {
    reserves++;
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({ json: { pin: "AB12CD" } });
  });
  await page.route("**/print/file/AB12CD", async (route) => {
    uploads++;
    await route.fulfill({ json: { pin: "AB12CD" } });
  });
  await page.goto("/?embeded=true&user_id=42&scopes=example");
  await expect(page.getByRole("banner")).toHaveCount(0);
  await page.getByLabel("Фамилия", { exact: true }).fill("Иванов");
  await page
    .getByLabel("Номер профсоюзного билета", { exact: true })
    .fill("123456");
  await page.locator("#file").setInputFiles({
    name: "Лекция.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7\nexample"),
  });
  await page.getByRole("button", { name: "Загрузить для печати" }).click();
  await expect(
    page.getByRole("heading", { name: "Можно идти к принтеру" }),
  ).toBeVisible();
  expect(reserves).toBe(1);
  expect(uploads).toBe(1);
  await expect(
    page.getByRole("link", { name: "Распечатать по QR" }),
  ).toHaveCount(testInfo.project.name === "mobile" ? 1 : 0);
  await page.getByRole("link", { name: "Открыть историю печати" }).click();
  await expect(page.getByText("Лекция.pdf", { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get("embeded")).toBe("true");
  expect(new URL(page.url()).searchParams.get("user_id")).toBe("42");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("upload failure preserves input and corrupt history remains usable", async ({
  page,
}) => {
  await page.route("**/print/file", (route) =>
    route.fulfill({ status: 403, json: { detail: "User error" } }),
  );
  await page.goto("/");
  await page.getByLabel("Фамилия", { exact: true }).fill("Иванов");
  await page
    .getByLabel("Номер профсоюзного билета", { exact: true })
    .fill("123");
  await page.locator("#file").setInputFiles({
    name: "file.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7\nexample"),
  });
  await page.getByRole("button", { name: "Загрузить для печати" }).click();
  await expect(page.getByRole("alert")).toContainText("Проверьте фамилию");
  await expect(page.getByLabel("Фамилия", { exact: true })).toHaveValue(
    "Иванов",
  );
  await page.evaluate(() => localStorage.setItem("print-history", "bad json"));
  await page.getByRole("link", { name: "История", exact: true }).click();
  await expect(page.getByText("Здесь будут ваши файлы")).toBeVisible();
});
test("camera is opt in and desktop QR stays gated", async ({
  page,
}, testInfo) => {
  let cameraCalls = 0;
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      writable: true,
      configurable: true,
      value: async () => {
        throw new DOMException("denied", "NotAllowedError");
      },
    });
  });
  page.on("request", (req) => {
    if (req.url().includes("/print/qr")) cameraCalls++;
  });
  await page.goto("/qr?embeded=true#AB12CD");
  if (testInfo.project.name === "desktop") {
    await expect(
      page.getByRole("heading", { name: "Сканируйте с телефона" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Включить камеру" }),
    ).toHaveCount(0);
  } else {
    await expect(page.locator("video")).toHaveCount(0);
    await page.getByRole("button", { name: "Включить камеру" }).click();
    await expect(page.getByRole("alert")).toContainText("Нет доступа к камере");
    await page.getByText("Распечатать по PIN без камеры").click();
    await expect(page.locator(".pin-fallback code")).toHaveText("AB12CD");
  }
  expect(cameraCalls).toBe(0);
});

test("profile fills automatically and sends token only to userdata", async ({
  page,
}) => {
  await page.route("**/userdata/user/42", async (route) => {
    expect(route.request().headers()["authorization"]).toBe("delegated");
    await route.fulfill({
      json: {
        items: [
          {
            category: "Личная информация",
            param: "Полное имя",
            value: "Петров Пётр Петрович",
          },
          {
            category: "Учетные данные",
            param: "Номер профсоюзного билета",
            value: "00123",
          },
        ],
      },
    });
  });
  await page.goto(
    "/?token=delegated&user_id=42&scopes=userdata.category.personal.read,userdata.category.credentials.read",
  );
  await expect(page.getByLabel("Фамилия", { exact: true })).toHaveValue(
    "Петров",
  );
  await expect(
    page.getByLabel("Номер профсоюзного билета", { exact: true }),
  ).toHaveValue("00123");
  await expect(page.getByRole("button", { name: /Заполнить из/ })).toHaveCount(
    0,
  );
  expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
});

test("late profile response does not overwrite user edits and missing data is silent", async ({
  page,
}) => {
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/userdata/user/42", async (route) => {
    await gate;
    await route.fulfill({
      json: {
        items: [
          {
            category: "Личная информация",
            param: "Полное имя",
            value: "Петров Пётр",
          },
          {
            category: "Учетные данные",
            param: "Номер профсоюзного билета",
            value: "555",
          },
        ],
      },
    });
  });
  await page.goto(
    "/?token=delegated&user_id=42&scopes=userdata.category.personal.read,userdata.category.credentials.read",
  );
  await page.getByLabel("Фамилия", { exact: true }).fill("Вручную");
  release?.();
  await expect(page.getByLabel("Фамилия", { exact: true })).toHaveValue(
    "Вручную",
  );
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("one mobile QR scan queues one job and closes the camera", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  let jobs = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const qrImage =
    "data:image/png;base64," +
    readFileSync("tests/fixtures/terminal.png").toString("base64");
  await page.addInitScript((imageUrl: string) => {
    navigator.mediaDevices.getUserMedia = async () => {
      const image = new Image();
      image.src = imageUrl;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 320;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0, 320, 320);
      const stream = canvas.captureStream(10);
      Object.assign(window, { testCameraTrack: stream.getVideoTracks()[0] });
      setInterval(() => context.drawImage(image, 0, 0, 320, 320), 100);
      return stream;
    };
  }, qrImage);
  await page.route("**/print/qr", async (route) => {
    jobs++;
    expect(route.request().postDataJSON()).toEqual({
      qr_token: "terminal-token",
      files: ["AB12CD"],
    });
    await gate;
    await route.fulfill({ json: { status: "ok" } });
  });
  await page.goto("/qr#AB12CD");
  const request = page.waitForRequest("**/print/qr");
  await page.getByRole("button", { name: "Включить камеру" }).click();
  await request;
  await page.getByRole("link", { name: "История", exact: true }).click();
  try {
    await expect(page).toHaveURL("http://127.0.0.1:9004/qr#AB12CD");
  } finally {
    release();
  }
  await expect(
    page.getByRole("heading", { name: "Отправлено на принтер" }),
  ).toBeVisible();
  expect(jobs).toBe(1);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { testCameraTrack?: MediaStreamTrack })
            .testCameraTrack?.readyState,
      ),
    )
    .toBe("ended");
  await expect(page.locator("video")).toHaveCount(0);
});

test("partial profile fills only available fields and unavailable profile leaves manual entry", async ({
  page,
}) => {
  await page.route("**/userdata/user/42", (route) =>
    route.fulfill({
      json: {
        items: [
          {
            category: "Личная информация",
            param: "Полное имя",
            value: "Иванов Иван",
          },
        ],
      },
    }),
  );
  await page.goto(
    "/?token=delegated&user_id=42&scopes=userdata.category.personal.read",
  );
  await expect(page.getByLabel("Фамилия", { exact: true })).toHaveValue(
    "Иванов",
  );
  await expect(
    page.getByLabel("Номер профсоюзного билета", { exact: true }),
  ).toHaveValue("");
  await page.route("**/userdata/user/42", (route) =>
    route.fulfill({ status: 403, json: { detail: "Forbidden" } }),
  );
  await page.reload();
  await expect(page.getByLabel("Фамилия", { exact: true })).toHaveValue("");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(
    page.getByLabel("Номер профсоюзного билета", { exact: true }),
  ).toBeEditable();
});

test("real iframe suppresses duplicate header and history can select files on mobile", async ({
  page,
}, testInfo) => {
  await page.route("**/iframe-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<iframe title="Принтер" src="/history?user_id=42" allow="camera; clipboard-write" style="width:100%;height:850px;border:0"></iframe>',
    }),
  );
  await page.addInitScript(() =>
    localStorage.setItem(
      "print-history",
      JSON.stringify([
        { pin: "AB12", name: "Первая.pdf" },
        { pin: "CD34", name: "Вторая.pdf" },
      ]),
    ),
  );
  await page.goto("/iframe-fixture");
  const frame = page.frameLocator("iframe");
  await expect(frame.getByRole("banner")).toHaveCount(0);
  await expect(frame.getByText("Первая.pdf", { exact: true })).toBeVisible();
  if (testInfo.project.name === "mobile") {
    await frame.getByRole("checkbox", { name: "Выбрать Первая.pdf" }).check();
    await frame.getByRole("checkbox", { name: "Выбрать Вторая.pdf" }).check();
    await frame
      .getByRole("link", { name: "Распечатать по QR", exact: true })
      .click();
    await expect(frame.getByText("Файлов для печати:")).toContainText("2");
  } else await expect(frame.getByRole("checkbox")).toHaveCount(0);
});

test("navigation cannot discard an in-flight upload or start a second submission", async ({
  page,
}) => {
  let submissions = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/print/file", async (route) => {
    submissions++;
    await route.fulfill({ json: { pin: "AB12CD" } });
  });
  await page.route("**/print/file/AB12CD", async (route) => {
    await gate;
    await route.fulfill({ json: { pin: "AB12CD" } });
  });
  await page.goto("/");
  await page.getByLabel("Фамилия", { exact: true }).fill("Иванов");
  await page
    .getByLabel("Номер профсоюзного билета", { exact: true })
    .fill("123");
  await page
    .locator("#file")
    .setInputFiles({
      name: "file.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\nexample"),
    });
  const request = page.waitForRequest("**/print/file/AB12CD");
  await page.getByRole("button", { name: "Загрузить для печати" }).click();
  await request;
  await page
    .locator("form")
    .evaluate((form) =>
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
  await page.getByRole("link", { name: "История", exact: true }).click();
  try {
    await expect(page).toHaveURL("http://127.0.0.1:9004/");
  } finally {
    release();
  }
  await expect(
    page.getByRole("heading", { name: "Можно идти к принтеру" }),
  ).toBeVisible();
  expect(submissions).toBe(1);
});

test("cleared user input is not restored by a delayed profile", async ({
  page,
}) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/userdata/user/42", async (route) => {
    await gate;
    await route.fulfill({
      json: {
        items: [
          {
            category: "Личная информация",
            param: "Полное имя",
            value: "Иванов Иван",
          },
          {
            category: "Учетные данные",
            param: "Номер профсоюзного билета",
            value: "555",
          },
        ],
      },
    });
  });
  await page.goto(
    "/?token=delegated&user_id=42&scopes=userdata.category.personal.read,userdata.category.credentials.read",
  );
  await page.getByLabel("Фамилия", { exact: true }).fill("Ввод");
  await page.getByLabel("Фамилия", { exact: true }).fill("");
  release();
  await expect(
    page.getByLabel("Номер профсоюзного билета", { exact: true }),
  ).toHaveValue("555");
  await expect(page.getByLabel("Фамилия", { exact: true })).toHaveValue("");
});
