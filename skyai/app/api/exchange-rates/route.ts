import { NextResponse } from "next/server";

const EXCHANGE_RATE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;

export async function GET() {
  if (!EXCHANGE_RATE_API_KEY || EXCHANGE_RATE_API_KEY === "tu-exchange-rate-api-key-aqui") {
    // Return mock rates if no key is configured
    return NextResponse.json({
      rates: {
        USD: 1,
        EUR: 0.95,
        COP: 3950,
        MXN: 18.5,
        BRL: 5.1,
        GBP: 0.82,
        ARS: 900,
        CLP: 950,
      },
    });
  }

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`, {
      next: { revalidate: 3600 * 24 }, // Cache for 24 hours
    });

    if (!res.ok) {
      throw new Error(`Exchange rate API error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      rates: data.conversion_rates,
    });
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    // Return mock rates as fallback
    return NextResponse.json({
      rates: {
        USD: 1,
        EUR: 0.95,
        COP: 3950,
        MXN: 18.5,
      },
    });
  }
}
