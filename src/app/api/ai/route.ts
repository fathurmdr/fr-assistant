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
    const aiResponse = await fetch(process.env.AI_URL ?? "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "deepseek-r1:1.5b",
        streaming: true,
        options: {
          temperature: 0.1,
          repeat_penalty: 1.2,
          numa: true, // testing for ARM
        },
        messages: [...messages],
      }),
    });
    if (!aiResponse.body) {
      console.error(aiResponse.body);
      throw new Error("ai response not ok");
    }

    return aiResponse;
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
