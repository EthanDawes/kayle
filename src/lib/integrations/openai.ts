import OpenAI from "openai"

export async function analyzeImage(
  apiKey: string,
  imageDataUrl: string | null,
  prompt: string,
): Promise<any> {
  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  try {
    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...(imageDataUrl
              ? [
                  {
                    type: "input_image" as const,
                    image_url: imageDataUrl,
                    detail: "low" as const,
                  },
                ]
              : []),
          ],
        },
      ],
      ...(imageDataUrl
        ? {
            text: {
              format: {
                type: "json_object" as const,
              },
            },
          }
        : {}),
      reasoning: {
        effort: "medium",
      },
    })

    console.log(response)
    const content = response.output_text
    if (!content) throw new Error("Empty response from OpenAI")

    const data = imageDataUrl ? JSON.parse(content) : content
    console.log(data)
    return data
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(error.message || `OpenAI ${error.status ?? "request failed"}`)
    }

    throw error
  }
}
