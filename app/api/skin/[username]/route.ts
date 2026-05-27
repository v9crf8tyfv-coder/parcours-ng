import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const size = req.nextUrl.searchParams.get("s") ?? "32";

  const apiKey = process.env.NATIONSGLORY_API_KEY ?? "";

  try {
    const res = await fetch(
      `https://skins.nationsglory.fr/face/${username}/${size}`,
      {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/png",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
