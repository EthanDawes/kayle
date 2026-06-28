import OpenAI from "openai"
import { settings } from "$lib/stores/settings.svelte"

function createClient(apiKey: string) {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

function apiError(error: unknown): Error {
  if (error instanceof OpenAI.APIError) {
    return new Error(error.message || `OpenRouter ${error.status ?? "request failed"}`)
  }
  return error instanceof Error ? error : new Error(String(error))
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
    const response = await client.chat.completions.create({
      model: settings.model,
      messages: [{ role: "user", content: prompt }],
    })

    console.log(response)
    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty response from OpenRouter")

    console.log(content)
    return content
  } catch (error) {
    throw apiError(error)
  }
}

export async function analyzeText(apiKey: string, prompt: string): Promise<any> {
  const client = createClient(apiKey)

  try {
    const response = await client.chat.completions.create({
      model: settings.model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    })

    console.log(response)
    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty response from OpenRouter")

    const data = JSON.parse(content)
    console.log(data)
    return data
  } catch (error) {
    throw apiError(error)
  }
}

export async function analyzeImage(
  apiKey: string,
  imageDataUrl: string,
  prompt: string,
): Promise<any> {
  const client = createClient(apiKey)

  try {
    const response = await client.chat.completions.create({
      model: settings.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    })

    console.log(response)
    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty response from OpenRouter")

    const data = JSON.parse(content)
    console.log(data)
    return data
  } catch (error) {
    throw apiError(error)
  }
}
