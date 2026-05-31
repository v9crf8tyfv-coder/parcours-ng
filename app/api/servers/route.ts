import { NextRequest, NextResponse } from "next/server";

export const dynamic    = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 10;

/* ─── Joueurs suivis ────────────────────────────────────────────── */
const TRACKED = [
  { username: "ixtazzking" },
  { username: "Orionyx84"  },
];

const BASE = "https://publicapi.nationsglory.fr";

/* Headers complets pour l'API /user (nécessaires pour éviter les blocages) */
const USER_HEADERS = (apiKey: string) => ({
  Authorization:     `Bearer ${apiKey}`,
  "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept:            "application/json, text/plain, */*",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
  Origin:            "https://nationsglory.fr",
  Referer:           "https://nationsglory.fr/",
});

export interface PlayerResult {
  username:      string;
  online:        boolean;
  nation:        string;
  skinHead:      string;
  whitePresent:  boolean; // true si le champ servers.white existe dans la réponse
}

async function fetchUserWhite(
  username: string,
  apiKey: string
): Promise<PlayerResult | null> {
  try {
    const res = await fetch(`${BASE}/user/${username}`, {
      headers: USER_HEADERS(apiKey),
      cache:   "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json() as {
      servers?: { white?: { online?: boolean; country?: string } };
      skin?:    { face?: string; head?: string };
    };

    const white    = data?.servers?.white;
    const skinBase = data?.skin?.face ?? data?.skin?.head;

    return {
      username,
      online:       white?.online  ?? false,
      nation:       white?.country ?? "",
      skinHead:     skinBase ? `${skinBase}/32` : `https://skins.nationsglory.fr/face/${username}/32`,
      whitePresent: white !== undefined,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.NATIONSGLORY_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
  }

  const searchRaw   = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const searchLower = searchRaw.toLowerCase();

  const usernamesBase = TRACKED.map((t) => t.username);
  const allUsernames  = [...usernamesBase];
  if (searchRaw && !allUsernames.some((u) => u.toLowerCase() === searchLower)) {
    allUsernames.push(searchRaw);
  }

  /* ── Requêtes parallèles ──
     Playercount : auth simple seulement (l'endpoint ne nécessite pas les headers browser)
  */
  const [countRes, ...userSettled] = await Promise.allSettled([
    fetch(`${BASE}/playercount`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache:   "no-store",
    }),
    ...allUsernames.map((u) => fetchUserWhite(u, apiKey)),
  ]);

  /* ── Nombre de joueurs ── */
  let playerCount: number | null = null;
  let playerMax:   number | null = null;
  if (
    countRes.status === "fulfilled" &&
    countRes.value instanceof Response &&
    countRes.value.ok
  ) {
    try {
      // L'API peut retourner { white: { players: X, maxplayers: Y } }
      // ou { white: X } selon la version
      const pc = await countRes.value.json() as Record<string, unknown>;
      const w  = pc?.white;
      if (typeof w === "number") {
        playerCount = w;
      } else if (w && typeof w === "object") {
        const wo = w as Record<string, unknown>;
        playerCount = typeof wo.players    === "number" ? wo.players    : null;
        playerMax   = typeof wo.maxplayers === "number" ? wo.maxplayers : null;
      }
    } catch {}
  }

  /* ── Données utilisateurs ── */
  const userData = userSettled.map((r) =>
    r.status === "fulfilled" ? r.value : null
  );

  /* ── Joueurs trackés en ligne ── */
  const onlinePlayers: PlayerResult[] = TRACKED
    .map((_, i) => userData[i])
    .filter((u): u is PlayerResult => u !== null && u.online);

  /* ── Résultat de recherche ── */
  let searchResult: PlayerResult | null = null;
  if (searchRaw) {
    const idx = allUsernames.findIndex((u) => u.toLowerCase() === searchLower);
    if (idx >= 0) searchResult = userData[idx] ?? null;
  }

  /* ── Statut serveur ──
     1. Si le playercount a répondu → on sait exactement
     2. Sinon, si au moins un joueur suivi a servers.white présent → serveur accessible
     3. Sinon → on ne peut pas déterminer, on affiche "?" côté client (pas "Fermé")
  */
  const serverOpenFromCount   = playerCount !== null;
  const serverOpenFromPlayers = userData
    .slice(0, TRACKED.length)
    .some((u) => u?.whitePresent === true);
  const serverOpen = serverOpenFromCount || serverOpenFromPlayers;
  const serverUnknown = !serverOpenFromCount && !serverOpenFromPlayers;

  return NextResponse.json({
    ok:            true,
    playerCount,
    playerMax,
    serverOpen,
    serverUnknown, // true si on ne peut pas déterminer le statut
    onlinePlayers,
    searchResult,
    timestamp:     new Date().toISOString(),
  });
}
