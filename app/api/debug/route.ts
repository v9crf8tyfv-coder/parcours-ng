import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* Endpoint de diagnostic — accès limité par le CRON_SECRET */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided =
      req.headers.get("authorization")?.replace("Bearer ", "") ??
      req.nextUrl.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const apiKey = process.env.NATIONSGLORY_API_KEY ?? "";
  const results: Record<string, unknown> = {
    hasApiKey: Boolean(apiKey),
    apiKeyLen: apiKey.length,
    timestamp: new Date().toISOString(),
  };

  /* Test connexion API NG */
  try {
    const r = await fetch("https://publicapi.nationsglory.fr/user/ixtazzking", {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      cache: "no-store",
    });
    const text = await r.text();
    let json: unknown = null;
    try { json = JSON.parse(text); } catch {}
    results.ngApi = {
      status: r.status,
      ok: r.ok,
      skinFace: (json as { skin?: { face?: string } })?.skin?.face,
      skinHead: (json as { skin?: { head?: string } })?.skin?.head,
      serversWhiteOnline: (json as { servers?: { white?: { online?: boolean } } })?.servers?.white?.online,
    };
  } catch (err) {
    results.ngApi = { error: String(err) };
  }

  /* Test URL skin directe */
  try {
    const r = await fetch("https://skins.nationsglory.fr/face/ixtazzking/64", { cache: "no-store" });
    results.skinDirect = { status: r.status, contentType: r.headers.get("content-type") };
  } catch (err) {
    results.skinDirect = { error: String(err) };
  }

  return NextResponse.json(results);
}
