import axios from "axios";

interface ProfileSession {
  token: string;
  userId: number;
}
interface UserInfo {
  category: string;
  param: string;
  value?: string | null;
}

export function profileSession(search: string): ProfileSession | null {
  const params = new URLSearchParams(search);
  const token = params.get("token");
  const id = params.get("user_id");
  const scopes = new Set((params.get("scopes") || "").split(","));
  if (
    !token ||
    !id ||
    !/^\d+$/.test(id) ||
    !Number.isSafeInteger(Number(id)) ||
    Number(id) < 1 ||
    (!scopes.has("userdata.category.personal.read") &&
      !scopes.has("userdata.category.credentials.read"))
  )
    return null;
  return { token, userId: Number(id) };
}

export async function loadPrintProfile(
  session: ProfileSession,
): Promise<{ surname?: string; number?: string }> {
  const url = new URL(process.env.VUE_APP_API_PRINTER || "");
  url.pathname = `/userdata/user/${session.userId}`;
  url.search = "";
  const { data } = await axios.get<{ items: UserInfo[] }>(url.toString(), {
    headers: { Authorization: session.token },
    timeout: 10_000,
  });
  const items = Array.isArray(data?.items) ? data.items : [];
  const fullName = items.find(
    (item) =>
      item?.category === "Личная информация" && item.param === "Полное имя",
  )?.value;
  const number = items.find(
    (item) =>
      item?.category === "Учетные данные" &&
      item.param === "Номер профсоюзного билета",
  )?.value;
  const result: { surname?: string; number?: string } = {};
  // The profile stores ФИО in surname-first order; keep the suggestion editable.
  if (typeof fullName === "string" && fullName.trim())
    result.surname = fullName.trim().split(/\s+/)[0];
  if (typeof number === "string" && /^[\p{L}\p{N}-]+$/u.test(number.trim()))
    result.number = number.trim();
  return result;
}
