/**
 * Utilitaire Upstash Redis REST API — sans aucun package npm.
 * Variables d'env nécessaires :
 *   UPSTASH_REDIS_REST_URL   → ex: https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN → le token REST d'Upstash
 */

const URL_KV   = process.env.UPSTASH_REDIS_REST_URL   ?? "";
const TOKEN_KV = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

export const KV_AVAILABLE = Boolean(URL_KV && TOKEN_KV);

async function cmd(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(URL_KV, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN_KV}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const json = await res.json();
  return json.result;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (!KV_AVAILABLE) return null;
  try {
    const result = await cmd(["GET", key]);
    if (result === null || result === undefined) return null;
    return typeof result === "string" ? (JSON.parse(result) as T) : (result as T);
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: unknown, exSeconds?: number): Promise<void> {
  if (!KV_AVAILABLE) return;
  try {
    const c: (string | number)[] = ["SET", key, JSON.stringify(value)];
    if (exSeconds) c.push("EX", exSeconds);
    await cmd(c);
  } catch {}
}

export async function kvDel(key: string): Promise<void> {
  if (!KV_AVAILABLE) return;
  try {
    await cmd(["DEL", key]);
  } catch {}
}
