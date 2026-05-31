import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { getWhitePlayerList } from "@/lib/yoxo";
import { getISOWeekId } from "@/lib/week-utils";
import { PLAYERS } from "@/lib/staff-config";

export const dynamic    = "force-dynamic";
export const maxDuration = 10;

interface Session {
  date:       string;
  minutes:    number;
  startTime?: number;
  endTime?:   number;
  source?:    string;
}

/**
 * GET /api/yoxo-sync?secret=xxx
 *
 * Récupère les données Yoxo d'hier pour le serveur White,
 * met à jour les sessions KV des joueurs trackés.
 * À appeler chaque jour à 2h du matin via cron-job.org.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Date d'hier
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date   = yesterday.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const weekId = getISOWeekId(yesterday);

  const results: Record<string, string> = {};

  let players: Awaited<ReturnType<typeof getWhitePlayerList>>;
  try {
    players = await getWhitePlayerList(date);
  } catch (err) {
    return NextResponse.json(
      { error: `Yoxo fetch failed: ${String(err)}`, date, weekId },
      { status: 502 }
    );
  }

  for (const player of PLAYERS) {
    try {
      const yoxoEntry = players.find(
        (p) => p.name.toLowerCase() === player.username.toLowerCase()
      );

      if (!yoxoEntry || yoxoEntry.playtime < 60) {
        results[player.username] =
          `ignoré (${yoxoEntry?.playtime ?? 0}s < 60s)`;
        continue;
      }

      const minutes = Math.round(yoxoEntry.playtime / 60);
      const key = `staff:${player.username}:sessions:${weekId}`;

      const existing = (await kvGet<Session[]>(key)) ?? [];
      // Retire toute entrée déjà présente pour cette date avant d'ajouter
      const filtered = existing.filter((s) => s.date !== date);
      filtered.push({ date, minutes, source: "yoxo" });

      // TTL 120 jours
      await kvSet(key, filtered, 60 * 60 * 24 * 120);
      results[player.username] = `${minutes} min enregistrés (yoxo)`;
    } catch (err) {
      results[player.username] = `erreur: ${String(err)}`;
    }
  }

  return NextResponse.json({
    ok:        true,
    date,
    weekId,
    results,
    timestamp: new Date().toISOString(),
  });
}
