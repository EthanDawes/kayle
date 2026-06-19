import OpenAI from "openai"

function createClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

/*
Which model to use?
4o and 5.4-mini are surprisingly the same cost, kinda expensive. I estimated at my usage, would cost $20/yr
Not bad, but I think I can do better

Deciding between 4o-mini, 5-nano, or 5.4-nano (all roughly same cost, with 5.4 most expensive)

https://developers.openai.com/api/docs/models/all
https://developers.openai.com/api/docs/pricing
 */

export async function askAI(apiKey: string, prompt: string): Promise<string> {
  const client = createClient(apiKey)

  try {
    const response = await client.responses.create({
      model: "gpt-5.4-nano",
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

export async function analyzeText(apiKey: string, prompt: string): Promise<any> {
  const client = createClient(apiKey)

  try {
    const response = await client.responses.create({
      model: "gpt-5.4-nano",
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      text: {
        format: {
          type: "json_object" as const,
        },
      },
      reasoning: {
        // All models before gpt-5.1 default to medium reasoning effort, and do not support none.
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

export async function analyzeImage(
  apiKey: string,
  imageDataUrl: string,
  prompt: string,
): Promise<any> {
  const client = createClient(apiKey)

  try {
    const response = await client.responses.create({
      model: "gpt-5.4-nano",
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
