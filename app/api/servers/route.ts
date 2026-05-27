import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ─── STAFF ──────────────────────────────────────────────────────
   Toujours affiché (online ou offline) dans la section Staff.
   gradeLevel: 1=Admin 2=SuperModo 3=Modo+ 4=Modo 5=ModoTest
   ─────────────────────────────────────────────────────────────── */
const STAFF_LIST = [
  { username: "ixtazzking", grade: "Modérateur", gradeLevel: 4, logo: "modo.png" },
  // { username: "pseudo", grade: "Administrateur", gradeLevel: 1, logo: "admin.png" },
];

/* ─── JOUEURS TRACKÉS ────────────────────────────────────────────
   Apparaît dans la section "Joueurs en ligne" UNIQUEMENT quand connecté.
   Ajoute juste le pseudo — pas besoin de grade ni logo.
   ─────────────────────────────────────────────────────────────── */
const TRACKED_USERNAMES: string[] = [
  // "pseudo1",
  // "pseudo2",
];

const BASE = "https://publicapi.nationsglory.fr";

async function fetchUserWhite(username: string, headers: Record<string, string>) {
  try {
    const res = await fetch(`${BASE}/user/${username}`, { headers, cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const white = data?.servers?.white;
    const skinHead = data?.skin?.head
      ? `${data.skin.head}/64`
      : `https://skins.nationsglory.fr/face/${username}/64`;
    return {
      username,
      online: white?.online ?? false,
      nation: white?.country ?? "",
      skinHead,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const apiKey = process.env.NATIONSGLORY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Clé API manquante", hint: "Vérifie parcours-ng/.env.local" },
      { status: 500 }
    );
  }

  const headers = { Authorization: `Bearer ${apiKey}` };

  // Toutes les requêtes en parallèle
  const [countRes, ...userResults] = await Promise.allSettled([
    fetch(`${BASE}/playercount`, { headers, cache: "no-store" }),
    ...[...STAFF_LIST.map((s) => s.username), ...TRACKED_USERNAMES].map((u) =>
      fetchUserWhite(u, headers)
    ),
  ]);

  // Playercount
  let playerCount: number | null = null;
  let playerMax: number | null = null;
  if (countRes.status === "fulfilled" && countRes.value instanceof Response && countRes.value.ok) {
    try {
      const pc = await countRes.value.json();
      playerCount = pc?.white?.players ?? null;
      playerMax = pc?.white?.maxplayers ?? null;
    } catch {}
  }

  // Répartir les résultats user
  const totalUsers = STAFF_LIST.length + TRACKED_USERNAMES.length;
  const userData: (any | null)[] = userResults.slice(0, totalUsers).map((r) =>
    r.status === "fulfilled" ? r.value : null
  );

  const staffUserData = userData.slice(0, STAFF_LIST.length);
  const trackedUserData = userData.slice(STAFF_LIST.length);

  // Staff : toujours retourné, online ou offline
  const staff = STAFF_LIST.map((s, i) => {
    const u = staffUserData[i];
    return {
      username: s.username,
      grade: s.grade,
      gradeLevel: s.gradeLevel,
      logo: s.logo,
      online: u?.online ?? false,
      nation: u?.nation ?? "",
      skinHead: u?.skinHead ?? `https://skins.nationsglory.fr/face/${s.username}/64`,
    };
  }).sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return a.gradeLevel - b.gradeLevel;
  });

  // Joueurs trackés : retourné UNIQUEMENT si online
  const onlinePlayers = TRACKED_USERNAMES
    .map((username, i) => {
      const u = trackedUserData[i];
      if (!u?.online) return null;
      return {
        username,
        online: true,
        nation: u.nation,
        skinHead: u.skinHead,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    ok: true,
    playerCount,
    playerMax,
    staff,
    onlinePlayers,
    timestamp: new Date().toISOString(),
  });
}
