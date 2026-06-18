import { getAllFoods } from "$lib/integrations/hfsGraphQL"
import { analyzeImage, analyzeText, askAI } from "$lib/integrations/openai"
import type { Nutrients } from "$lib/models/meal"
import type { NumericNutrientKey } from "$lib/services/DiningCourtService"
import { unscaleNutrientValue } from "$lib/utils/nutrientUnits"

export interface FoodAnalysis {
  title: string
  nutrients: Nutrients
}

export interface ServingAnalysis {
  servings: Record<string, number>
  unknowns: string[]
}

const FOOD_JSON_SCHEMA = `{
  calories: number
  totalFatGrams: number
  saturatedFatGrams: number
  transFatGrams: number
  cholesterolMilligrams: number
  sodiumMilligrams: number
  totalCarbohydrateGrams: number
  dietaryFiberGrams: number
  totalSugarsGrams: number
  addedSugarsGrams: number
  proteinGrams: number
  vitaminDMicrograms: number
  vitaminCMilligrams: number
  calciumMilligrams: number
  ironMilligrams: number
  potassiumMilligrams: number
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
      "Return a JSON object with this shape: {",
      "title: comma-seperated list of things you see, no quantities",
      "nutrients: " + FOOD_JSON_SCHEMA,
      "}\nReturn only valid JSON, no markdown fences.",
    ].join("\n")

    const result = (await (imageDataUrl
      ? analyzeImage(apiKey, imageDataUrl, prompt)
      : analyzeText(apiKey, prompt))) as FoodAnalysis
    result.nutrients = LLMNutrientsToNormal(result.nutrients)
    return result
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
      "Here are some foods and their serving sizes (menu context):",
      menuContext,
      "",
      `Now, analyze ${foodSource}.`,
      "Respond with a JSON object: {servings: map of the food items with a multiple of its serving size, unknowns: list of foods and portion consumed that aren't in the menu context, but included in the analysis}",
      "Return only valid JSON, no markdown fences.",
    ].join("\n")

    return imageDataUrl ? analyzeImage(apiKey, imageDataUrl, prompt) : analyzeText(apiKey, prompt)
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

// LLM outputs Nutrients struct, but with units affixed. Example: `totalFatGrams` must become `totalFat`
// Needed because LLM sometimes doesn't normalize to grams when asked. This will also allow me to use a cheaper non-thinking model.
function LLMNutrientsToNormal(llmNutrients: Nutrients) {
  const nutrients: Nutrients = {}
  for (const [nutrient, quantity] of Object.entries(llmNutrients)) {
    const noUnitNutrient = nutrient.replace(/Grams|Milligrams|Micrograms/, "") as NumericNutrientKey
    nutrients[noUnitNutrient] = unscaleNutrientValue(noUnitNutrient, quantity)
  }
  return nutrients
}
