import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hex = req.nextUrl.searchParams.get("hex");
  if (!hex || !/^[0-9a-f]{5}$/.test(hex)) {
    return NextResponse.json({ error: "Invalid hex" }, { status: 400 });
  }

  const url = `https://cdn.jsdelivr.net/gh/kanjivg/kanjivg@master/kanji/${hex}.svg`;

  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const text = await res.text();
    const dValues: string[] = [];
    const pathRegex = /<path[^>]*\bd=(?:"([^"]+)"|'([^']+)')/g;
    let match;
    while ((match = pathRegex.exec(text)) !== null) {
      dValues.push(match[1] ?? match[2]);
    }
    return NextResponse.json({ paths: dValues });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
