import { NextRequest, NextResponse } from "next/server";
import { getAttractionSuggestions } from "@/lib/api/ticketmaster";

const CITIES = [
  { id: "paris", name: "Paris", country: "France" },
  { id: "london", name: "London", country: "UK" },
  { id: "barcelona", name: "Barcelona", country: "Spain" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands" },
  { id: "berlin", name: "Berlin", country: "Germany" },
  { id: "madrid", name: "Madrid", country: "Spain" },
  { id: "rome", name: "Rome", country: "Italy" },
  { id: "milan", name: "Milan", country: "Italy" },
  { id: "lisbon", name: "Lisbon", country: "Portugal" },
  { id: "brussels", name: "Brussels", country: "Belgium" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const lower = q.toLowerCase();

  try {
    const [attractions, citySuggestions] = await Promise.allSettled([
      getAttractionSuggestions(q),
      Promise.resolve(
        CITIES
          .filter((c) => c.name.toLowerCase().startsWith(lower))
          .slice(0, 3)
          .map((c) => ({
            id: c.id,
            name: c.name,
            type: "city" as const,
            subtitle: c.country,
          }))
      ),
    ]);

    const artistResults = attractions.status === "fulfilled"
      ? attractions.value.slice(0, 5).map((a: any) => ({
          id: a.id,
          name: a.name,
          type: "artist" as const,
          subtitle: a.classifications?.[0]?.genre?.name,
        }))
      : [];

    const cityResults = citySuggestions.status === "fulfilled"
      ? citySuggestions.value
      : [];

    const suggestions = [...artistResults, ...cityResults].slice(0, 8);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ suggestions: [] });
  }
}
