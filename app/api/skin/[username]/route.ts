import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* Ordre de priorité des sources de skin */
const skinSources = (username: string, size: string) => [
  /* 1. NationsGlory (bloqué depuis les data centers, essai quand même) */
  `https://skins.nationsglory.fr/face/${username}/${size}`,
  /* 2. Minotar — skin Minecraft officiel, toujours accessible */
  `https://minotar.net/helm/${username}/${size}.png`,
  /* 3. mc-heads — autre service de secours */
  `https://mc-heads.net/avatar/${username}/${size}`,
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const size = req.nextUrl.searchParams.get("s") ?? "64";
  const apiKey = process.env.NATIONSGLORY_API_KEY ?? "";

  /* ── Essai 0 : URL skin depuis l'API NG (auth) ── */
  let ngSkinUrl: string | null = null;
  if (apiKey) {
    try {
      const r = await fetch(
        `https://publicapi.nationsglory.fr/user/${username}`,
        { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" }
      );
      if (r.ok) {
        const d = await r.json();
        const base = d?.skin?.face ?? d?.skin?.head;
        if (base) ngSkinUrl = `${base}/${size}`;
      }
    } catch {}
  }

  /* ── Essais successifs jusqu'à trouver une image valide ── */
  const urls = [
    ...(ngSkinUrl ? [ngSkinUrl] : []),
    ...skinSources(username, size),
  ];

  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const ct = r.headers.get("Content-Type") ?? "";
      if (!ct.startsWith("image/")) continue;
      const buffer = await r.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": ct,
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        },
      });
    } catch {}
  }

  return new NextResponse(null, { status: 502 });
}
