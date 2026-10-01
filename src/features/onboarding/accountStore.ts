export type StoredAccount = {
  applicationType: string;
  name: string;
  mobile: string;
};

const ACCOUNT_STORE_KEY = "caprockAccounts";

export function readAccountStore(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, StoredAccount>)
      : {};
  } catch {
    return {};
  }
}

export function saveAccount(email: string, account: StoredAccount): void {
  try {
    const key = email.trim().toLowerCase();
    if (!key) return;
    const store = readAccountStore();
    store[key] = account;
    localStorage.setItem(ACCOUNT_STORE_KEY, JSON.stringify(store));
  } catch {
    /* Storage unavailable (e.g. private mode) — session still works. */
  }
}

export function getAccount(email: string): StoredAccount | undefined {
  const key = email.trim().toLowerCase();
  if (!key) return undefined;
  return readAccountStore()[key];
}
