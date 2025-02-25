import { streamText } from "ai";
import { createOllama } from "ollama-ai-provider";

async function chat(req: Request) {
  const { messages } = await req.json();

  if (!Array.isArray(messages)) {
    return Response.json(
      {
        error: "messages must be an array",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const ollama = createOllama({ baseURL: process.env.AI_BASE_URL + "/api" });

    const result = streamText({
      model: ollama(process.env.AI_MODEL ?? "deepseek-r1:1.5b"),
      messages: [...messages],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: "something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}

export { chat as POST };
