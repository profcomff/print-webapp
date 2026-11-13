import axios, { type AxiosProgressEvent } from "axios";

export interface PrintRequest {
  surname: string;
  number: string;
  file: File;
  copies: number;
  pages: string;
}
const base = () => process.env.VUE_APP_API_PRINTER;

export async function uploadFile(
  input: PrintRequest,
  progress: (percent: number) => void,
): Promise<string> {
  const { data } = await axios.post<{ pin: string }>(
    `${base()}/file`,
    {
      surname: input.surname.trim(),
      number: input.number.trim(),
      filename: input.file.name,
      source: "webapp",
      options: { copies: input.copies, pages: input.pages.replace(/\s/g, "") },
    },
    { timeout: 30_000 },
  );
  if (!data.pin || !/^[a-z0-9]+$/i.test(data.pin))
    throw new Error("Invalid PIN response");
  const body = new FormData();
  body.append("file", input.file);
  await axios.post(`${base()}/file/${data.pin}`, body, {
    timeout: 120_000,
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (event.total)
        progress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    },
  });
  progress(100);
  return data.pin;
}

export async function printQr(token: string, pins: string[]): Promise<void> {
  const files = [...new Set(pins)];
  if (
    !token.trim() ||
    !files.length ||
    files.length > 10 ||
    files.some((pin) => !/^[a-z0-9]+$/i.test(pin))
  )
    throw new Error("Выберите от одного до десяти файлов.");
  const { data } = await axios.post<{ status?: string; detail?: string }>(
    `${base()}/qr`,
    { qr_token: token, files },
    { timeout: 30_000 },
  );
  if (data?.status !== "ok")
    throw new Error(
      data?.detail === "Terminal not found by qr"
        ? "QR-код недействителен. Отсканируйте код на экране принтера."
        : "Принтер не подтвердил запуск. Проверьте его экран перед повторной попыткой.",
    );
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 403) return "Проверьте фамилию и номер профсоюзного билета.";
    if (status === 404)
      return "Код не найден или срок хранения файла истёк. Загрузите файл заново.";
    if (status === 413)
      return "Превышен допустимый размер файла или количество страниц. Уменьшите файл или выберите меньше страниц.";
    if (status === 415)
      return "Не удалось обработать PDF. Экспортируйте документ в PDF заново.";
    if (status === 416)
      return "Проверьте номера страниц: таких страниц может не быть в документе.";
    if (status === 422)
      return "Проверьте параметры печати и повторите отправку.";
    if (error.response?.data?.detail === "Terminal not found by qr")
      return "QR-код недействителен. Отсканируйте код на экране принтера.";
    if (status && status >= 500)
      return "Сервис временно недоступен. Попробуйте позже.";
  }
  return "Не удалось получить ответ. Проверьте соединение с интернетом и попробуйте снова.";
}
