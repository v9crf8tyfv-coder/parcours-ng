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

  /* Test KV Upstash */
  const kvUrl   = process.env.UPSTASH_REDIS_REST_URL ?? "";
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  results.kvAvailable = Boolean(kvUrl && kvToken);

  if (results.kvAvailable) {
    try {
      const weekId = new Date().toISOString().slice(0, 4) + "-W" +
        String(Math.ceil((Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7)).padStart(2, "0");

      const kvRes = await fetch(kvUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(["GET", `staff:ixtazzking:sessions:${weekId}`]),
      });
      const kvData = await kvRes.json();
      results.kvSessions = { weekId, raw: kvData.result };

      const onlineRes = await fetch(kvUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(["GET", "staff:ixtazzking:online"]),
      });
      const onlineData = await onlineRes.json();
      results.kvOnline = onlineData.result;
    } catch (err) {
      results.kvError = String(err);
    }
  }

  return NextResponse.json(results);
}
