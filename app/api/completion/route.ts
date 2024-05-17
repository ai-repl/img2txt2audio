import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Ratelimit } from "@upstash/ratelimit";

import { isSupportedImageType } from "@/app/utils";
import { decodeBase64Image } from "@/lib/image";
import { redis } from "@/lib/redis";

export const runtime = "edge";

const openai = new OpenAI();

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1440 m"),
      analytics: true,
    })
  : false;

export async function POST(req: Request) {
  // if (ratelimit) {
  //   const ip = req.headers.get("x-real-ip") ?? "local";
  //   const rl = await ratelimit.limit(ip);

  //   if (!rl.success) {
  //     return new Response("Rate limit exceeded", { status: 429 });
  //   }
  // }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
    return new Response(
      "Missing OPENAI_API_KEY – make sure to add it to your .env file.",
      {
        status: 400,
      }
    );
  }

  const { prompt } = await req.json();

  // roughly 4.5MB in base64
  if (prompt.length > 6_464_471) {
    return new Response("Image too large, maximum file size is 4.5MB.", {
      status: 400,
    });
  }

  const { type, data } = decodeBase64Image(prompt);

  if (!type || !data)
    return new Response("Invalid image data", { status: 400 });

  if (!isSupportedImageType(type)) {
    return new Response(
      "Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported.",
      { status: 400 }
    );
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Begin each of the following with a triangle symbol (▲ U+25B2):
            	Tell me What's in this image?, please analyze the image and provide a detailed description, Do not describe or extract text in the description.
            	Second, the text extracted from the image, with newlines where applicable. Un-obstruct text if it is covered by something, to make it readable.
            	If there is no text in the image, only respond with the description. Do not include any other information.
            	Example: ▲ Lines of code in a text editor.▲ const x = 5; const y = 10; const z = x + y; console.log(z);
            `,
          },
          {
            type: "image_url",
            image_url: {
              url: prompt,
            },
          },
        ],
      },
    ],
    stream: true,
    max_tokens: 300,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
