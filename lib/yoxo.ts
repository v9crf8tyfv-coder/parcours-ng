/**
 * Yoxo API — OAuth2 Client Credentials + Player List
 * Docs : https://api.yoxo.software/docs
 *
 * Env vars nécessaires :
 *   YOXO_CLIENT_ID     → ex: yoxo_ee8a465...
 *   YOXO_CLIENT_SECRET → ex: yxs_6a6cc6...
 */

import { kvGet, kvSet } from "@/lib/kv";

export const YOXO_AVAILABLE = Boolean(
  process.env.YOXO_CLIENT_ID && process.env.YOXO_CLIENT_SECRET
);

const CLIENT_ID     = process.env.YOXO_CLIENT_ID     ?? "";
const CLIENT_SECRET = process.env.YOXO_CLIENT_SECRET ?? "";

const TOKEN_KEY = "yoxo:access_token";

interface CachedToken {
  access_token: string;
  expires_at: number; // ms timestamp
}

export interface YoxoPlayer {
  name:              string;
  country:           string;
  playtime:          number; // secondes sur le serveur ce jour-là
  playtimeInterserver?: number;
  lastLogin:         number; // ms timestamp
  grade:             string;
  isPrime:           boolean;
}

/* ── Récupère (ou renouvelle) le token OAuth2 ── */
export async function getYoxoToken(): Promise<string> {
  const cached = await kvGet<CachedToken>(TOKEN_KEY);
  if (cached && Date.now() < cached.expires_at - 60_000) {
    return cached.access_token;
  }

  const res = await fetch("https://auth.yoxo.software/oauth2/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      grant_type:    "client_credentials",
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Yoxo auth failed (${res.status}): ${body}`);
  }

  const json = await res.json() as { access_token: string; expires_in: number };
  const token: CachedToken = {
    access_token: json.access_token,
    expires_at:   Date.now() + json.expires_in * 1_000,
  };

  // Cache 50 min (légèrement sous la durée d'expiration standard 1h)
  await kvSet(TOKEN_KEY, token, 50 * 60);
  return token.access_token;
}

/* ── Liste des joueurs White pour une date donnée ── */
export async function getWhitePlayerList(date: string): Promise<YoxoPlayer[]> {
  // date : "YYYY-MM-DD"
  const token = await getYoxoToken();

  const res = await fetch(
    `https://api.yoxo.software/v2/java/player-list/${date}/white`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache:   "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Yoxo player-list failed (${res.status}): ${body}`);
  }

  const json = await res.json() as { data?: YoxoPlayer[] };
  return json.data ?? [];
}
