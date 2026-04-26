import { NextRequest, NextResponse } from "next/server";
import { searchHotels } from "@/lib/api/amadeus";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "48.8566");
  const lng = parseFloat(searchParams.get("lng") || "2.3522");
  const checkIn = searchParams.get("checkIn") || new Date().toISOString().split("T")[0];
  const checkOut = searchParams.get("checkOut") || new Date(Date.now() + 86400000).toISOString().split("T")[0];

  try {
    const hotels = await searchHotels({ latitude: lat, longitude: lng, checkIn, checkOut });
    return NextResponse.json({ hotels });
  } catch (error) {
    console.error("Hotels API error:", error);
    return NextResponse.json({ hotels: [] }, { status: 200 });
  }
}
