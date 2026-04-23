import type { Nutrients } from "$lib/models/meal"

export interface FoodAnalysis extends Nutrients {
  description?: string
}

export async function analyzeFood(
  apiKey: string,
  imageDataUrl: string,
  menuContext?: string,
): Promise<FoodAnalysis> {
  const prompt = [
    "Analyze the food in this image. Return a JSON object with this shape:",
    `
// All units are in grams
export interface Nutrients {
  description: string (one short sentence)
  calories: number
  totalFat: number
  saturatedFat: number
  transFat: number
  cholesterol: number
  sodium: number
  totalCarbohydrate: number
  dietaryFiber: number
  totalSugars: number
  addedSugars: number
  protein: number
  vitaminD: number
  vitaminC: number
  calcium: number
  iron: number
  potassium: number
}`,
    "\nReturn only valid JSON, no markdown fences.",
  ].join("\n")

  const altPrompt = [
    "Here are some foods and their serving sizes:",
    menuContext,
    "",
    "Now, analyze the food in this image and respond with a JSON object mapping the food items you see with a multiple of its serving size.",
    "Return only valid JSON, no markdown fences.",
  ].join("\n")

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
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "low" } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 256,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ?? `OpenAI ${res.status}`,
    )
  }

  const data = await res.json()
  const content: string | undefined = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty response from OpenAI")

  return JSON.parse(content) as FoodAnalysis
}
