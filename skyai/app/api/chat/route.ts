import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json();

  const systemPrompt = `Eres SkyBot, el asistente de inteligencia artificial de SkyAI, la mejor plataforma de búsqueda de vuelos del mundo.

Tus capacidades:
- Ayudar a encontrar y comparar vuelos, hoteles y paquetes de viaje
- Recomendar destinos según preferencias del usuario
- Explicar cuándo es mejor comprar un vuelo (predicción de precios)
- Responder preguntas sobre aeropuertos, escalas, equipaje, visa
- Sugerir actividades y atracciones en los destinos
- Ayudar con cambios y cancelaciones de vuelos
- Hablar sobre requisitos de visa por país

Contexto actual del usuario:
${context ? JSON.stringify(context) : "El usuario está en la página principal."}

Reglas:
- Responde siempre en el idioma del usuario
- Sé conciso pero completo
- Usa emojis ocasionalmente para hacer la conversación amigable
- Si el usuario pregunta por vuelos específicos, dile que puede usar el buscador
- No inventes precios exactos, da rangos aproximados
- Sé honesto sobre tus limitaciones
- Cuando hables de predicción de precios, explica que son estimaciones basadas en tendencias históricas`;

  // If no API key, return mock response
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "tu-openai-api-key-aqui") {
    const userMessage = messages[messages.length - 1]?.content ?? "";
    const mockResponses: Record<string, string> = {
      hola: "¡Hola! Soy SkyBot 🤖✈️ Tu asistente de viajes con IA. ¿En qué puedo ayudarte hoy? Puedo ayudarte a encontrar vuelos baratos, recomendar destinos, o explicarte cuándo es mejor comprar tu vuelo.",
      vuelo: "Para encontrar el mejor vuelo, te recomiendo buscar con al menos 3-4 semanas de anticipación ✈️. Los martes y miércoles suelen tener los precios más bajos. ¿A dónde quieres viajar?",
      barato: "Los trucos para encontrar vuelos baratos son: 🔥\n\n1. Viajar en temporada baja\n2. Ser flexible con las fechas (±3 días)\n3. Buscar vuelos con escala\n4. Activar alertas de precio\n5. Reservar con 6-8 semanas de anticipación",
      default: "Entiendo tu pregunta. Como asistente de SkyAI, puedo ayudarte con búsqueda de vuelos, hoteles, predicción de precios y recomendaciones de destinos. ¿Tienes alguna pregunta específica sobre tu próximo viaje? ✈️",
    };

    const lowerMsg = userMessage.toLowerCase();
    let response = mockResponses.default;
    for (const [key, val] of Object.entries(mockResponses)) {
      if (key !== "default" && lowerMsg.includes(key)) {
        response = val;
        break;
      }
    }

    return NextResponse.json({
      message: response,
      source: "mock",
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content ?? "Lo siento, no pude procesar tu solicitud.";

    return NextResponse.json({ message, source: "openai" });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json(
      { message: "Lo siento, el asistente no está disponible en este momento. Por favor intenta más tarde." },
      { status: 200 }
    );
  }
}
