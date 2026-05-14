import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_HOST = "sky-scrapper.p.rapidapi.com";

const MOCK_HOTELS = [
  {
    id: "H001",
    name: "Grand Hyatt Miami",
    stars: 5,
    rating: 9.2,
    reviewCount: 2841,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    address: "2400 SE 2nd Ave, Miami, FL",
    city: "Miami",
    price: 245,
    currency: "USD",
    pricePerNight: true,
    amenities: ["pool", "spa", "wifi", "gym", "restaurant", "bar"],
    cancellation: "Cancelación gratuita hasta 24h antes",
    deal: false,
  },
  {
    id: "H002",
    name: "Marriott Biscayne Bay",
    stars: 4,
    rating: 8.7,
    reviewCount: 1920,
    image: "https://images.unsplash.com/photo-1551882547-ff40c4a49b5f?w=800",
    address: "1633 N Bayshore Dr, Miami, FL",
    city: "Miami",
    price: 178,
    currency: "USD",
    pricePerNight: true,
    amenities: ["pool", "wifi", "gym", "restaurant"],
    cancellation: "Cancelación gratuita",
    deal: true,
  },
  {
    id: "H003",
    name: "Hampton Inn & Suites",
    stars: 3,
    rating: 8.1,
    reviewCount: 1105,
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
    address: "50 Biscayne Blvd N, Miami, FL",
    city: "Miami",
    price: 119,
    currency: "USD",
    pricePerNight: true,
    amenities: ["wifi", "gym", "breakfast"],
    cancellation: "Cancelación gratuita hasta 48h",
    deal: false,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? "Miami";
  const checkin = searchParams.get("checkin") ?? "2026-06-15";
  const checkout = searchParams.get("checkout") ?? "2026-06-20";
  const adults = searchParams.get("adults") ?? "2";

  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === "tu-rapidapi-key-aqui") {
    return NextResponse.json({ hotels: MOCK_HOTELS, source: "mock", total: MOCK_HOTELS.length });
  }

  try {
    const entityId = "27539793"; // Miami entity ID - in production, this would be looked up
    const url = `https://sky-scrapper.p.rapidapi.com/api/v1/hotels/searchHotels?entityId=${entityId}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&currency=USD&locale=es-ES&market=ES`;

    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
      next: { revalidate: 600 },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();

    return NextResponse.json({ hotels: data?.data?.hotels ?? MOCK_HOTELS, source: "live" });
  } catch (error) {
    console.error("Hotels API error:", error);
    return NextResponse.json({ hotels: MOCK_HOTELS, source: "mock", total: MOCK_HOTELS.length });
  }
}
