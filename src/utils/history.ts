export interface HistoryItem {
  pin: string;
  name: string;
  createdAt?: string;
}
type ReadStorage = Pick<Storage, "getItem">;
type WriteStorage = Pick<Storage, "getItem" | "setItem">;

export function readStorage(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}
export function writeStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
export function get_history(storage?: ReadStorage): HistoryItem[] {
  try {
    const value: unknown = JSON.parse(
      storage
        ? storage.getItem("print-history") || "[]"
        : readStorage("print-history") || "[]",
    );
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (item): item is HistoryItem =>
          !!item &&
          typeof item.pin === "string" &&
          /^[a-z0-9]+$/i.test(item.pin) &&
          typeof item.name === "string",
      )
      .slice(-10);
  } catch {
    return [];
  }
}
export function add_history(
  pin: string,
  name: string,
  storage?: WriteStorage,
): boolean {
  const items = get_history(storage)
    .filter((item) => item.pin !== pin)
    .slice(-9);
  items.push({ pin, name, createdAt: new Date().toISOString() });
  try {
    if (storage) {
      storage.setItem("print-history", JSON.stringify(items));
      return true;
    }
    return writeStorage("print-history", JSON.stringify(items));
  } catch {
    return false;
  }
}
