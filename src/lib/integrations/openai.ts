export async function analyzeImage(
  apiKey: string,
  imageDataUrl: string | null,
  prompt: string,
): Promise<any> {
  const conversation = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: imageDataUrl, detail: "low" } },
  ]
  if (imageDataUrl === null) conversation.pop()
  const response_format = imageDataUrl ? { type: "json_object" } : undefined

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini", // o4 is faster, but did not use proper units. Maybe ok if only need to recognise portions though
      messages: [
        {
          role: "user",
          content: conversation,
        },
      ],
      response_format,
      reasoning: {
        effort: "medium",
        summary: "auto",
      },
      // max_tokens: 256,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ?? `OpenAI ${res.status}`,
    )
  }

  const data = await res.json()
  console.log(data)
  const content: string | undefined = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty response from OpenAI")

  const parsed = imageDataUrl ? JSON.parse(content) : content
  console.log(parsed)
  return parsed
}
