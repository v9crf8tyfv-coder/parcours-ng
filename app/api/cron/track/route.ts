import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet, kvDel, KV_AVAILABLE } from "@/lib/kv";
import { getISOWeekId } from "@/lib/week-utils";

export const dynamic = "force-dynamic";

const STAFF = ["ixtazzking", "Orionyx84"];
const NG_API = "https://publicapi.nationsglory.fr";

/* ─────────────────────────────────────────────────────────────────
   Endpoint appelé toutes les 5 minutes par cron-job.org (ou Vercel Cron Pro).
   Logique :
     - Vérifie si chaque staff est connecté sur White via l'API NG
     - Si vient de se connecter → enregistre l'heure de début
     - Si vient de se déconnecter → calcule la durée, sauvegarde la session
   ───────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  /* ── Sécurité : vérifie le secret ── */
  const validSecret = process.env.CRON_SECRET;
  if (validSecret) {
    const fromHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    const fromQuery  = req.nextUrl.searchParams.get("secret");
    if (fromHeader !== validSecret && fromQuery !== validSecret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  if (!KV_AVAILABLE) {
    return NextResponse.json({
      error: "KV non configuré — ajoute UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN dans les variables d'env Vercel",
    }, { status: 500 });
  }

  const apiKey = process.env.NATIONSGLORY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NATIONSGLORY_API_KEY manquant" }, { status: 500 });
  }

  const now  = Date.now();
  const log: string[] = [];

  for (const username of STAFF) {
    try {
      /* ── Récupère le statut en ligne via l'API NG ── */
      const res = await fetch(`${NG_API}/user/${username}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });

      if (!res.ok) {
        log.push(`${username}: API NG erreur ${res.status}`);
        continue;
      }

      const data     = await res.json();
      const isOnline = (data?.servers?.white?.online ?? false) as boolean;

      /* ── Lit l'état précédent depuis KV ── */
      const [prevOnline, sessionStart] = await Promise.all([
        kvGet<boolean>(`staff:${username}:online`),
        kvGet<number>(`staff:${username}:session_start`),
      ]);

      if (!prevOnline && isOnline) {
        /* Vient de se connecter → mémorise l'heure de début */
        await kvSet(`staff:${username}:session_start`, now);
        log.push(`${username}: vient de se connecter`);

      } else if (prevOnline && !isOnline && sessionStart) {
        /* Vient de se déconnecter → enregistre la session */
        const minutes = Math.round((now - sessionStart) / 60000);

        if (minutes >= 2) {
          const weekId = getISOWeekId(new Date());
          const date   = new Date().toISOString().slice(0, 10);
          const key    = `staff:${username}:sessions:${weekId}`;

          const existing = (await kvGet<{ date: string; minutes: number }[]>(key)) ?? [];
          existing.push({ date, minutes });

          /* Garde les données 120 jours */
          await kvSet(key, existing, 60 * 60 * 24 * 120);
          log.push(`${username}: session enregistrée — ${minutes} min`);
        } else {
          log.push(`${username}: déconnecté après ${minutes} min (trop court, ignoré)`);
        }

        await kvDel(`staff:${username}:session_start`);

      } else {
        log.push(`${username}: ${isOnline ? "toujours en ligne" : "toujours hors ligne"}`);
      }

      /* ── Met à jour le statut actuel ── */
      await kvSet(`staff:${username}:online`, isOnline);

    } catch (err) {
      log.push(`${username}: erreur — ${String(err)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    log,
  });
}
