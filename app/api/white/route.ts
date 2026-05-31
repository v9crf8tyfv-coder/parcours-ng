import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { getWhitePlayerList, YOXO_AVAILABLE, YoxoPlayer } from "@/lib/yoxo";

export const dynamic    = "force-dynamic";
export const maxDuration = 10;

const BASE = "https://publicapi.nationsglory.fr";

const USER_HEADERS = (k: string) => ({
  Authorization:     `Bearer ${k}`,
  "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept:            "application/json, text/plain, */*",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
  Origin:            "https://nationsglory.fr",
  Referer:           "https://nationsglory.fr/",
});

function dateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Yoxo list pour une date, avec TTL configurable */
async function getCachedList(
  date: string,
  ttlSeconds: number
): Promise<YoxoPlayer[] | null> {
  if (!YOXO_AVAILABLE) return null;
  // clé différente pour "aujourd'hui" (cache court) vs "hier" (cache long)
  const key = `yoxo:list:white:${date}:${ttlSeconds < 3600 ? "live" : "daily"}`;
  const hit = await kvGet<YoxoPlayer[]>(key);
  if (hit) return hit;
  try {
    const list = await getWhitePlayerList(date);
    if (list.length > 0) await kvSet(key, list, ttlSeconds);
    return list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

/** NationsGlory user lookup — retourne null pour servers si joueur ≠ proprio clé */
async function ngUser(username: string, apiKey: string) {
  try {
    const r = await fetch(`${BASE}/user/${username}`, {
      headers: USER_HEADERS(apiKey),
      cache:   "no-store",
    });
    if (!r.ok) return null;
    const d = await r.json() as {
      servers?: { white?: { online?: boolean; country?: string } } | null;
      skin?:    { face?: string; head?: string };
    };
    const w   = d?.servers?.white;
    const skb = d?.skin?.face ?? d?.skin?.head;
    const online: boolean | null = d?.servers == null ? null : (w?.online ?? null);
    return {
      online,
      nation:   w?.country ?? "",
      skinHead: skb ? `${skb}/32` : null,
    };
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.NATIONSGLORY_API_KEY ?? "";
  if (!apiKey) return NextResponse.json({ error: "API key manquante" }, { status: 500 });

  const searchRaw  = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const todayDate  = dateStr(0);
  const yesterDate = dateStr(-1);
  const nowMs      = Date.now();

  /* ── Toutes les requêtes en parallèle ──────────────────────────
     1. Yoxo aujourd'hui   (cache 5 min — données potentiellement live)
     2. Yoxo hier          (cache 24h  — données finales)
     3. Playercount NG     (token en query param)
     4. NationsGlory user  (seulement si recherche)
  ──────────────────────────────────────────────────────────────── */
  const [todaySettled, yesterSettled, countSettled, searchSettled] =
    await Promise.allSettled([
      getCachedList(todayDate,  5 * 60),
      getCachedList(yesterDate, 24 * 60 * 60),
      fetch(`${BASE}/playercount?token=${encodeURIComponent(apiKey)}`, { cache: "no-store" }),
      searchRaw ? ngUser(searchRaw, apiKey) : Promise.resolve(null),
    ]);

  /* ── Playercount ── */
  let playerCount: number | null = null;
  let playerMax:   number | null = null;
  let _rawPlayercount: unknown = null;
  if (
    countSettled.status === "fulfilled" &&
    countSettled.value instanceof Response &&
    countSettled.value.ok
  ) {
    try {
      const pc = await countSettled.value.json() as Record<string, unknown>;
      _rawPlayercount = pc;
      // Vérifie qu'il n'y a pas d'erreur dans la réponse
      if (!pc?.error) {
        const w = pc?.white;
        if (typeof w === "number") { playerCount = w; }
        else if (w && typeof w === "object") {
          const wo = w as Record<string, unknown>;
          playerCount = typeof wo.players    === "number" ? wo.players    : null;
          playerMax   = typeof wo.maxplayers === "number" ? wo.maxplayers : null;
        }
      }
    } catch {}
  }

  /* ── Listes Yoxo ── */
  const todayList:  YoxoPlayer[] | null = todaySettled.status  === "fulfilled" ? todaySettled.value  : null;
  const yesterList: YoxoPlayer[] | null = yesterSettled.status === "fulfilled" ? yesterSettled.value : null;

  /* ── Section "Actifs aujourd'hui" (Yoxo today, trié par lastLogin desc) ── */
  let todayStats: {
    date:         string;
    totalPlayers: number;
    players: {
      name:       string;
      country:    string;
      minutes:    number;
      grade:      string;
      isPrime:    boolean;
      lastLogin:  number;
      minutesAgo: number;
    }[];
  } | null = null;

  if (todayList && todayList.length > 0) {
    const sorted = [...todayList].sort((a, b) => b.lastLogin - a.lastLogin);
    todayStats = {
      date:         todayDate,
      totalPlayers: todayList.length,
      players:      sorted.slice(0, 20).map((p) => ({
        name:       p.name,
        country:    p.country,
        minutes:    Math.round(p.playtime / 60),
        grade:      typeof p.grade === "string" ? p.grade : "",
        isPrime:    Boolean(p.isPrime),
        lastLogin:  p.lastLogin,
        minutesAgo: Math.round((nowMs - p.lastLogin) / 60_000),
      })),
    };
  }

  /* ── Section "Hier sur White" (Yoxo yesterday, trié par playtime desc) ── */
  let yesterStats: {
    date:         string;
    totalPlayers: number;
    topPlayers: {
      name:    string;
      country: string;
      minutes: number;
      grade:   string;
      isPrime: boolean;
    }[];
  } | null = null;

  if (yesterList && yesterList.length > 0) {
    const sorted = [...yesterList].sort((a, b) => b.playtime - a.playtime);
    yesterStats = {
      date:         yesterDate,
      totalPlayers: yesterList.length,
      topPlayers:   sorted.slice(0, 15).map((p) => ({
        name:    p.name,
        country: p.country,
        minutes: Math.round(p.playtime / 60),
        grade:   typeof p.grade === "string" ? p.grade : "",
        isPrime: Boolean(p.isPrime),
      })),
    };
  }

  /* ── Résultat de recherche ── */
  type OnlineStatus = "online" | "recent" | "today" | "offline" | "unknown";
  let searchResult: {
    username:         string;
    onlineStatus:     OnlineStatus;
    nation:           string;
    skinHead:         string | null;
    todayMinutes:     number | null;
    yesterdayMinutes: number | null;
    lastLogin:        number | null;
    minutesAgo:       number | null;
    grade:            string | null;
    isPrime:          boolean;
  } | null = null;

  if (searchRaw) {
    const ng        = (searchSettled.status === "fulfilled" ? searchSettled.value : null) as Awaited<ReturnType<typeof ngUser>> | null;
    const todayE    = todayList?.find((p) => p.name.toLowerCase() === searchRaw.toLowerCase());
    const yesterE   = yesterList?.find((p) => p.name.toLowerCase() === searchRaw.toLowerCase());

    // Statut online : NationsGlory en priorité, sinon Yoxo lastLogin
    let onlineStatus: OnlineStatus = "unknown";
    if (ng?.online === true)  onlineStatus = "online";
    else if (ng?.online === false) onlineStatus = "offline";
    else if (todayE) {
      const ago = (nowMs - todayE.lastLogin) / 60_000;
      onlineStatus = ago < 60 ? "recent" : "today";
    }

    const nation = ng?.nation || todayE?.country || yesterE?.country || "";

    searchResult = {
      username:         searchRaw,
      onlineStatus,
      nation,
      skinHead:         ng?.skinHead ?? null,
      todayMinutes:     todayE  ? Math.round(todayE.playtime  / 60) : null,
      yesterdayMinutes: yesterE ? Math.round(yesterE.playtime / 60) : null,
      lastLogin:        todayE?.lastLogin ?? null,
      minutesAgo:       todayE ? Math.round((nowMs - todayE.lastLogin) / 60_000) : null,
      grade:            (todayE?.grade ?? yesterE?.grade) ? String(todayE?.grade ?? yesterE?.grade) : null,
      isPrime:          Boolean(todayE?.isPrime ?? yesterE?.isPrime),
    };
  }

  /* ── serverOpen ── */
  const serverOpen    = playerCount !== null || (todayList !== null && todayList.length > 0);
  const serverUnknown = !serverOpen;

  return NextResponse.json({
    ok:            true,
    playerCount,
    playerMax,
    serverOpen,
    serverUnknown,
    today:         todayStats,
    yesterday:     yesterStats,
    searchResult,
    yoxoAvailable: YOXO_AVAILABLE,
    _rawPlayercount,             // debug : voir la vraie réponse du playercount
    timestamp:     new Date().toISOString(),
  });
}
