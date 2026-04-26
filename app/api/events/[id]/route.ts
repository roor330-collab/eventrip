import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/api/ticketmaster";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEventById(params.id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (error) {
    console.error("Event detail API error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}
