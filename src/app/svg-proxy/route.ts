import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin SVG proxy — avoids <object> download/CORS issues with Storage URLs.
 * GET /svg-proxy?url=<encoded public svg url>
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  // Only allow public storage / known SVG hosts (Supabase storage paths)
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();
  const looksLikeStorage =
    host.includes("supabase.co") ||
    path.includes("/storage/") ||
    path.endsWith(".svg");

  if (!looksLikeStorage) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: { Accept: "image/svg+xml,text/plain,*/*" },
      cache: "force-cache",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream ${upstream.status}` },
        { status: 502 }
      );
    }

    const text = await upstream.text();
    if (!text.includes("<svg")) {
      return NextResponse.json(
        { error: "Response is not an SVG" },
        { status: 502 }
      );
    }

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch SVG layout",
      },
      { status: 502 }
    );
  }
}
