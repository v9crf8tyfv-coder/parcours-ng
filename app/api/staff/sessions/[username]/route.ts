import { NextRequest, NextResponse } from "next/server";
import { kvGet, KV_AVAILABLE } from "@/lib/kv";
import { getISOWeekId } from "@/lib/week-utils";
import { getWeekSessions } from "@/lib/staff-data";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────────────────────────
   GET /api/staff/sessions/{username}?week=2026-W22
   Retourne les sessions d'un joueur pour une semaine donnée.
   Priorité : données KV (tracking auto) → données statiques (lib/staff-data.ts)
   ───────────────────────────────────────────────────────────────── */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const weekId = req.nextUrl.searchParams.get("week") ?? getISOWeekId(new Date());

  if (KV_AVAILABLE) {
    try {
      const sessions =
        (await kvGet<{ date: string; minutes: number }[]>(
          `staff:${username}:sessions:${weekId}`
        )) ?? [];

      return NextResponse.json({ sessions, weekId, source: "kv" });
    } catch {
      /* KV disponible mais erreur → fallback static */
    }
  }

  /* Fallback : données manuelles dans lib/staff-data.ts */
  const sessions = getWeekSessions(username, weekId);
  return NextResponse.json({ sessions, weekId, source: "static" });
}
