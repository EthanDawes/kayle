import OpenAI from "openai"

function createClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

export async function askAI(apiKey: string, prompt: string): Promise<string> {
  const client = createClient(apiKey)

  try {
    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
    })

    console.log(response)
    const content = response.output_text
    if (!content) throw new Error("Empty response from OpenAI")

    console.log(content)
    return content
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(error.message || `OpenAI ${error.status ?? "request failed"}`)
    }

    throw error
  }
}

export async function analyzeImage(
  apiKey: string,
  imageDataUrl: string,
  prompt: string,
): Promise<any> {
  const client = createClient(apiKey)

  try {
    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image" as const,
              image_url: imageDataUrl,
              detail: "low" as const,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_object" as const,
        },
      },
      reasoning: {
        effort: "medium",
      },
    })

    console.log(response)
    const content = response.output_text
    if (!content) throw new Error("Empty response from OpenAI")

    const data = JSON.parse(content)
    console.log(data)
    return data
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(error.message || `OpenAI ${error.status ?? "request failed"}`)
    }

    throw error
  }
}
