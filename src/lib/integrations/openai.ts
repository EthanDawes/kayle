export interface FoodAnalysis {
  name: string
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  servingSize?: string
  description?: string
}

export async function analyzeFood(
  apiKey: string,
  imageDataUrl: string,
  menuContext?: string,
): Promise<FoodAnalysis> {
  const prompt = [
    "Analyze the food in this image. Return a JSON object with these fields:",
    "- name: string (specific food name)",
    "- calories: number (estimated kcal for the visible portion)",
    "- protein: number (grams)",
    "- fat: number (grams)",
    "- carbs: number (grams)",
    "- servingSize: string (e.g. '1 cup', '200g', '1 slice')",
    "- description: string (one short sentence)",
    menuContext
      ? `\nThis food may be from a dining hall. Context:\n${menuContext}\nMatch the item if possible for better accuracy.`
      : "",
    "\nReturn only valid JSON, no markdown fences.",
  ]
    .filter(Boolean)
    .join("\n")

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
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
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenAI ${res.status}`)
  }

  const data = await res.json()
  const content: string | undefined = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Empty response from OpenAI")

  return JSON.parse(content) as FoodAnalysis
}
