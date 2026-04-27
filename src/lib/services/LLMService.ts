import { getAllFoods } from "$lib/integrations/hfsGraphQL"
import { analyzeImage, analyzeText, askAI } from "$lib/integrations/openai"
import type { Nutrients } from "$lib/models/meal"

export interface FoodAnalysis {
  nutrients: Nutrients
  description: string
}

export interface ServingAnalysis {
  servings: Record<string, number>
  description: string
}

const FOOD_JSON_SCHEMA = `
{
  description: string (one short sentence)
  // All units are in grams
  nutrients: {
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
  }
}`

export const LLMService = {
  async analyzeFood(
    apiKey: string,
    imageDataUrl: string | undefined,
    textDescription?: string,
  ): Promise<FoodAnalysis> {
    const intro = imageDataUrl
      ? "Analyze the food in this image."
      : `The user described what they ate as: "${textDescription}". Estimate the nutrition.`
    const prompt = [
      intro,
      "Return a JSON object with this shape:",
      FOOD_JSON_SCHEMA,
      "\nReturn only valid JSON, no markdown fences.",
    ].join("\n")

    return imageDataUrl
      ? analyzeImage(apiKey, imageDataUrl, prompt)
      : analyzeText(apiKey, prompt)
  },

  async analyzeDiningCourtMeal(
    apiKey: string,
    imageDataUrl: string | undefined,
    menuContext: string,
    textDescription?: string,
  ): Promise<ServingAnalysis> {
    const foodSource = imageDataUrl
      ? "the food in this image"
      : `what the user described: "${textDescription}"`
    const prompt = [
      "Here are some foods and their serving sizes:",
      menuContext,
      "",
      `Now, analyze ${foodSource} and respond with a JSON object: {servings: map of the food items with a multiple of its serving size, description: string (1 short sentence)}`,
      "Return only valid JSON, no markdown fences.",
    ].join("\n")

    return imageDataUrl
      ? analyzeImage(apiKey, imageDataUrl, prompt)
      : analyzeText(apiKey, prompt)
  },

  async suggestMeals(apiKey: string) {
    const menuContext = JSON.stringify(await getAllFoods())

    const prompt = [
      "Suggest 3 nutritious, balanced meals following the USDA myplate guidelines. All the items for one meal must come from the same location.",
      "",
      menuContext,
      "",
      "Describe each meal in 1 sentence, each on its own bullet point. This is all for the same meal period",
    ].join("\n")

    return askAI(apiKey, prompt)
  },
}
