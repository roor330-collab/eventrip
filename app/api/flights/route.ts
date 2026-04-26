import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/api/amadeus";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin") || "CDG";
  const destination = searchParams.get("destination") || "LHR";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const adults = parseInt(searchParams.get("adults") || "1");

  try {
    const flights = await searchFlights({ origin, destination, date, adults });
    return NextResponse.json({ flights });
  } catch (error) {
    console.error("Flights API error:", error);
    return NextResponse.json({ flights: [] }, { status: 200 });
  }
}
