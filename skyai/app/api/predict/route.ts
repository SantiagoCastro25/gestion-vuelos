import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export async function POST(req: NextRequest) {
  const { origin, destination, departureDate, returnDate, currentPrice } = await req.json();

  // Mock prediction data
  const mockPrediction = {
    recommendation: "Buen momento para comprar",
    confidence: 78,
    priceScore: "good",
    currentPrice: currentPrice ?? 285,
    predictedLow: 245,
    predictedHigh: 380,
    bestDayToBuy: "En los próximos 3-5 días",
    priceHistory: [
      { date: "Hace 30d", price: 320 },
      { date: "Hace 21d", price: 305 },
      { date: "Hace 14d", price: 298 },
      { date: "Hace 7d", price: 290 },
      { date: "Hace 3d", price: 285 },
      { date: "Hoy", price: currentPrice ?? 285 },
      { date: "+3d", price: 275, predicted: true },
      { date: "+7d", price: 265, predicted: true },
      { date: "+14d", price: 280, predicted: true },
      { date: "+21d", price: 310, predicted: true },
      { date: "+30d", price: 340, predicted: true },
    ],
    tips: [
      "El precio lleva bajando 15 días consecutivos",
      "La ruta tiende a ser más barata los martes y miércoles",
      "Aún hay 45 días hasta la salida — tiempo suficiente para esperar",
      "Solo quedan 4 asientos a este precio",
    ],
    aiAnalysis: "",
  };

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "tu-openai-api-key-aqui") {
    mockPrediction.aiAnalysis = `Basándome en patrones históricos de la ruta ${origin} → ${destination}, el precio actual de $${currentPrice ?? 285} USD está aproximadamente un 12% por debajo del promedio de los últimos 30 días. 📊\n\nLa tendencia indica que los precios podrían bajar un poco más en los próximos 5-7 días antes de comenzar a subir conforme se acerca la fecha de salida. Si tienes flexibilidad, esperar 3-5 días más podría ahorrarte entre $20-$40 adicionales. Sin embargo, si los asientos disponibles son pocos, te recomendamos comprar pronto para asegurar tu lugar. ✅`;
    return NextResponse.json(mockPrediction);
  }

  try {
    const prompt = `Analiza la predicción de precio para este vuelo:
- Ruta: ${origin} → ${destination}
- Fecha de salida: ${departureDate}
- Fecha de regreso: ${returnDate ?? "Solo ida"}
- Precio actual: $${currentPrice} USD
- Historial (últimos 30 días): precios han bajado un ~12%

Proporciona un análisis conciso de 2-3 párrafos en español sobre:
1. Si es buen momento para comprar
2. La tendencia de precios
3. Una recomendación final

Sé directo, usa datos concretos y termina con una recomendación clara.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.6,
    });

    mockPrediction.aiAnalysis = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json(mockPrediction);
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(mockPrediction);
  }
}
