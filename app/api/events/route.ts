import { NextRequest, NextResponse } from "next/server";
import { searchEvents } from "@/lib/api/ticketmaster";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || undefined;
  const city = searchParams.get("city") || undefined;
  const page = parseInt(searchParams.get("page") || "0");

  try {
    const events = await searchEvents({ keyword: q, type, city, page, size: 20 });
    return NextResponse.json({ events, total: events.length });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json({ events: [], total: 0 }, { status: 200 });
  }
}
