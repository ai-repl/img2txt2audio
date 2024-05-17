import OpenAI from "openai";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  // Check if the OPENAI_API_KEY is set, if not return 400
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
    return new Response(
      "Missing OPENAI_API_KEY – make sure to add it to your .env file.",
      {
        status: 400,
      }
    );
  }
  let { prompt, audio, model } = await req.json();

  const response = await openai.audio.speech.create({
    model,
    audio,
    input: prompt,
  });

  const blob = new Blob([await response.arrayBuffer()], { type: "audio/mpeg" });

  // Respond with the blob
  return new Response(blob);
}
