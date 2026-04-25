import { DiningCourtService } from "$lib/services/DiningCourtService"
import { LLMService, type FoodAnalysis } from "$lib/services/LLMService"
import { settings } from "$lib/stores/settings.svelte"
import type { Nutrients, NutritionInfo } from "$lib/models/meal"

export async function processFoodPhoto(
  imageDataUrl: string,
  diningCourt?: string,
): Promise<NutritionInfo> {
  if (!settings.hasOpenai) {
    throw new Error("OpenAI API key not set. Go to Settings to add your key.")
  }

  let analysis: FoodAnalysis

  if (diningCourt) {
    const menuNutrition = await DiningCourtService.getMenuNutrition(diningCourt)
    const menuContext = DiningCourtService.getServingSizesContext(menuNutrition)
    const servingAnalysis = await LLMService.analyzeDiningCourtMeal(
      settings.openaiKey,
      imageDataUrl,
      menuContext,
    )
    const nutrients = Object.entries(servingAnalysis.servings).reduce((acc, [key, value]) => {
      return DiningCourtService.addNutrients(
        acc,
        DiningCourtService.multiplyNutrients(menuNutrition[key], value),
      )
    }, {} as Nutrients)
    analysis = { description: servingAnalysis.description, nutrients }
  } else {
    analysis = await LLMService.analyzeFood(settings.openaiKey, imageDataUrl)
  }

  return { ...analysis, source: "openai", name: "Meal TODO" }
}
