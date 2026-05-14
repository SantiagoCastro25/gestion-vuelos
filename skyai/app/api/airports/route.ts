import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_HOST = "sky-scrapper.p.rapidapi.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ airports: [] });
  }

  // Fallback if no real API key
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "tu-rapidapi-key-aqui") {
    // Return some mock hardcoded airports matching the query
    const MOCK_AIRPORTS = [
      { code: "BOG", name: "Bogotá", country: "Colombia" },
      { code: "MDE", name: "Medellín", country: "Colombia" },
      { code: "MIA", name: "Miami", country: "Estados Unidos" },
      { code: "JFK", name: "Nueva York", country: "Estados Unidos" },
      { code: "MAD", name: "Madrid", country: "España" },
    ];
    return NextResponse.json({
      airports: MOCK_AIRPORTS.filter(
        (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.code.toLowerCase().includes(query.toLowerCase())
      ),
    });
  }

  try {
    const res = await fetch(`https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=es-ES`, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch airports");
    }

    const json = await res.json();
    
    const airports = json.data
      ?.filter((item: any) => item.navigation?.entityType === "AIRPORT" || item.navigation?.entityType === "CITY")
      .map((item: any) => ({
        code: item.navigation?.relevantFlightParams?.skyId ?? item.navigation?.entityId,
        name: item.presentation?.title,
        country: item.presentation?.subtitle,
        type: item.navigation?.entityType,
      })) ?? [];

    return NextResponse.json({ airports });
  } catch (error) {
    console.error("Airport search error:", error);
    return NextResponse.json({ airports: [] });
  }
}
