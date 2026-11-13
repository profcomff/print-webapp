export async function validateFile(file: File): Promise<string> {
  if (!file.size) return "Файл пуст. Выберите PDF с содержимым.";
  if (file.size > 25_000_000) return "Файл больше 25 МБ. Уменьшите его размер.";
  if (!/\.pdf$/i.test(file.name)) return "Выберите файл в формате PDF.";
  try {
    if (!(await file.slice(0, 5).text()).startsWith("%PDF-"))
      return "Файл не похож на PDF. Попробуйте экспортировать документ заново.";
  } catch {
    return "Не удалось прочитать файл. Выберите его снова.";
  }
  return "";
}

export function validatePages(value: string): string {
  if (!value.trim()) return "";
  const valid = value.split(",").every((part) => {
    const match = part.trim().match(/^([1-9]\d*)(?:\s*-\s*([1-9]\d*))?$/);
    return (
      match &&
      Number.isSafeInteger(Number(match[1])) &&
      (!match[2] ||
        (Number.isSafeInteger(Number(match[2])) &&
          Number(match[2]) >= Number(match[1])))
    );
  });
  return valid
    ? ""
    : "Укажите страницы, например: 1–3, 5 (через обычный дефис).";
}

export function parsePins(hash: string): string[] {
  return [
    ...new Set(
      hash
        .replace(/^#/, "")
        .split(",")
        .filter((pin) => /^[a-z0-9]+$/i.test(pin)),
    ),
  ].slice(0, 10);
}
