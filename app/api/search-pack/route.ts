import { NextRequest, NextResponse } from "next/server";
import { searchEvents } from "@/lib/api/ticketmaster";
import { searchFlights, searchHotels } from "@/lib/api/amadeus";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || undefined;
  const date = searchParams.get("date") || undefined;
  const origin = searchParams.get("origin") || "CDG";

  try {
    const [events, flights] = await Promise.allSettled([
      searchEvents({ keyword: q, city, size: 6 }),
      searchFlights({
        origin,
        destination: "PAR",
        date: date || new Date().toISOString().split("T")[0],
        adults: 1,
      }),
    ]);

    const eventsData = events.status === "fulfilled" ? events.value : [];
    const flightsData = flights.status === "fulfilled" ? flights.value : [];

    let hotelsData: any[] = [];
    if (eventsData.length > 0 && eventsData[0].latitude) {
      const hotelResult = await searchHotels({
        latitude: eventsData[0].latitude,
        longitude: eventsData[0].longitude!,
        checkIn: date || new Date().toISOString().split("T")[0],
        checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      }).catch(() => []);
      hotelsData = hotelResult;
    }

    return NextResponse.json({
      events: eventsData,
      flights: flightsData,
      hotels: hotelsData,
    });
  } catch (error) {
    console.error("Search pack API error:", error);
    return NextResponse.json({ events: [], flights: [], hotels: [] }, { status: 200 });
  }
}
