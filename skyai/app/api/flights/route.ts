import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_HOST = "sky-scrapper.p.rapidapi.com";

// Mock data for development when no API key is set
const MOCK_FLIGHTS = [
  {
    id: "FL001",
    airline: "Avianca",
    airlineCode: "AV",
    airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/AV.png",
    flightNumber: "AV 123",
    origin: "BOG",
    originCity: "Bogotá",
    destination: "MIA",
    destinationCity: "Miami",
    departure: "2026-06-15T06:00:00",
    arrival: "2026-06-15T10:30:00",
    duration: "4h 30m",
    stops: 0,
    stopDescription: "Directo",
    price: 285,
    currency: "USD",
    cabin: "Economy",
    seatsLeft: 4,
    priceScore: "excellent",
    priceLabel: "Precio Excelente",
    amenities: ["wifi", "meals"],
    refundable: false,
  },
  {
    id: "FL002",
    airline: "LATAM Airlines",
    airlineCode: "LA",
    airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/LA.png",
    flightNumber: "LA 456",
    origin: "BOG",
    originCity: "Bogotá",
    destination: "MIA",
    destinationCity: "Miami",
    departure: "2026-06-15T09:15:00",
    arrival: "2026-06-15T15:00:00",
    duration: "5h 45m",
    stops: 1,
    stopDescription: "1 escala en Lima",
    price: 199,
    currency: "USD",
    cabin: "Economy",
    seatsLeft: 12,
    priceScore: "good",
    priceLabel: "Buen Precio",
    amenities: ["meals"],
    refundable: true,
  },
  {
    id: "FL003",
    airline: "American Airlines",
    airlineCode: "AA",
    airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/AA.png",
    flightNumber: "AA 789",
    origin: "BOG",
    originCity: "Bogotá",
    destination: "MIA",
    destinationCity: "Miami",
    departure: "2026-06-15T13:45:00",
    arrival: "2026-06-15T18:00:00",
    duration: "4h 15m",
    stops: 0,
    stopDescription: "Directo",
    price: 420,
    currency: "USD",
    cabin: "Economy",
    seatsLeft: 8,
    priceScore: "high",
    priceLabel: "Precio Alto",
    amenities: ["wifi", "meals", "entertainment"],
    refundable: true,
  },
  {
    id: "FL004",
    airline: "Copa Airlines",
    airlineCode: "CM",
    airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/CM.png",
    flightNumber: "CM 321",
    origin: "BOG",
    originCity: "Bogotá",
    destination: "MIA",
    destinationCity: "Miami",
    departure: "2026-06-15T18:30:00",
    arrival: "2026-06-15T22:45:00",
    duration: "4h 15m",
    stops: 1,
    stopDescription: "1 escala en Panamá",
    price: 245,
    currency: "USD",
    cabin: "Economy",
    seatsLeft: 2,
    priceScore: "good",
    priceLabel: "Buen Precio",
    amenities: ["meals"],
    refundable: false,
  },
  {
    id: "FL005",
    airline: "United Airlines",
    airlineCode: "UA",
    airlineLogo: "https://logos.skyscnr.com/images/airlines/favicon/UA.png",
    flightNumber: "UA 567",
    origin: "BOG",
    originCity: "Bogotá",
    destination: "MIA",
    destinationCity: "Miami",
    departure: "2026-06-15T23:59:00",
    arrival: "2026-06-16T04:30:00",
    duration: "4h 31m",
    stops: 0,
    stopDescription: "Directo",
    price: 310,
    currency: "USD",
    cabin: "Economy",
    seatsLeft: 6,
    priceScore: "good",
    priceLabel: "Buen Precio",
    amenities: ["wifi", "entertainment"],
    refundable: true,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin") ?? "BOG";
  const destination = searchParams.get("destination") ?? "MIA";
  const date = searchParams.get("date") ?? "2026-06-15";
  const adults = searchParams.get("adults") ?? "1";
  const cabinClass = searchParams.get("cabinClass") ?? "economy";

  // If no API key, return mock data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "tu-rapidapi-key-aqui") {
    const mockData = MOCK_FLIGHTS.map((f) => ({
      ...f,
      origin,
      destination,
      departure: `${date}T${f.departure.split("T")[1]}`,
      arrival: `${date}T${f.arrival.split("T")[1]}`,
    }));
    return NextResponse.json({ flights: mockData, source: "mock", total: mockData.length });
  }

  try {
    // 1. Fetch entity IDs
    const getEntityId = async (code: string) => {
      const res = await fetch(`https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${code}&locale=es-ES`, {
        headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": RAPIDAPI_HOST },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data?.[0]?.navigation?.relevantFlightParams?.entityId || null;
    };

    const originEntityId = await getEntityId(origin);
    const destinationEntityId = await getEntityId(destination);

    if (!originEntityId || !destinationEntityId) {
      console.warn("Entity IDs not found, falling back to mock");
      return NextResponse.json({ flights: MOCK_FLIGHTS, source: "mock", total: MOCK_FLIGHTS.length });
    }

    // 2. Sky Scrapper API (v2)
    const url = `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlights?originSkyId=${origin}&destinationSkyId=${destination}&originEntityId=${originEntityId}&destinationEntityId=${destinationEntityId}&date=${date}&adults=${adults}&cabinClass=${cabinClass}&currency=USD&locale=es-ES&market=ES`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
      next: { revalidate: 300 }, // Cache 5 min
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Sky Scrapper response to our format
    const flights =
      data?.data?.itineraries?.map(
        (itinerary: {
          id: string;
          legs?: Array<{
            carriers?: { marketing?: Array<{ name: string; alternateId: string }> };
            segments?: Array<{ flightNumber: string }>;
            origin?: { displayCode: string; city: string };
            destination?: { displayCode: string; city: string };
            departure: string;
            arrival: string;
            durationInMinutes: number;
            stopCount: number;
          }>;
          price?: { raw: number; formatted: string };
        }) => {
          const leg = itinerary.legs?.[0];
          const carrier = leg?.carriers?.marketing?.[0];
          const durationH = Math.floor((leg?.durationInMinutes ?? 0) / 60);
          const durationM = (leg?.durationInMinutes ?? 0) % 60;
          return {
            id: itinerary.id,
            airline: carrier?.name ?? "Unknown",
            airlineCode: carrier?.alternateId ?? "??",
            flightNumber: leg?.segments?.[0]?.flightNumber ?? "N/A",
            origin: leg?.origin?.displayCode ?? origin,
            originCity: leg?.origin?.city ?? origin,
            destination: leg?.destination?.displayCode ?? destination,
            destinationCity: leg?.destination?.city ?? destination,
            departure: leg?.departure,
            arrival: leg?.arrival,
            duration: `${durationH}h ${durationM}m`,
            stops: leg?.stopCount ?? 0,
            stopDescription:
              (leg?.stopCount ?? 0) === 0 ? "Directo" : `${leg?.stopCount} escala(s)`,
            price: itinerary.price?.raw ?? 0,
            currency: "USD",
            cabin: cabinClass,
            priceScore: (itinerary.price?.raw ?? 999) < 300 ? "excellent" : (itinerary.price?.raw ?? 999) < 500 ? "good" : "high",
            priceLabel:
              (itinerary.price?.raw ?? 999) < 300
                ? "Precio Excelente"
                : (itinerary.price?.raw ?? 999) < 500
                ? "Buen Precio"
                : "Precio Alto",
          };
        }
      ) ?? [];

    return NextResponse.json({ flights, source: "live", total: flights.length });
  } catch (error) {
    console.error("Flight API error:", error);
    // Fallback to mock data
    return NextResponse.json({ flights: MOCK_FLIGHTS, source: "mock", total: MOCK_FLIGHTS.length });
  }
}
