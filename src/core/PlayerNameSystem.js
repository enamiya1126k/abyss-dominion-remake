// Keep the existing online identity/name storage: no second player profile.
export const PLAYER_NAME_STORAGE_KEY = "abyss-dominion-online-display-name";
export const PLAYER_NAME_MAX_LENGTH = 16;

export function normalizePlayerName(value) {
  return String(value ?? "").normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, "").trim();
}

export function readPlayerName(fallback = "冒険者") {
  let stored = "";
  try { stored = localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? ""; } catch {}
  // Match the server's UTF-16 limit without splitting a surrogate pair.
  return (normalizePlayerName(stored) || normalizePlayerName(fallback))
    .slice(0, PLAYER_NAME_MAX_LENGTH).replace(/[\uD800-\uDBFF]$/, "");
}

export function savePlayerName(value) {
  const name = normalizePlayerName(value);
  if (!name) return { ok: false, message: "プレイヤー名を入力してください。" };
  if (name.length > PLAYER_NAME_MAX_LENGTH) return { ok: false, message: "プレイヤー名は16文字以内で入力してください。" };
  try { localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name); }
  catch { return { ok: false, message: "名前を保存できませんでした。もう一度お試しください。" }; }
  return { ok: true, name };
}
