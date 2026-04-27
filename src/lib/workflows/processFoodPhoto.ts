import { DiningCourtService } from "$lib/services/DiningCourtService"
import { LLMService, type FoodAnalysis } from "$lib/services/LLMService"
import { settings } from "$lib/stores/settings.svelte"
import type { Nutrients, NutritionInfo } from "$lib/models/meal"

export async function processFoodPhoto(
  imageDataUrl: string | undefined,
  diningCourt?: string,
  textDescription?: string,
): Promise<NutritionInfo> {
  if (!settings.hasOpenai) {
    throw new Error("OpenAI API key not set. Go to Settings to add your key.")
  }

  let analysis: FoodAnalysis
  let explaination: string | undefined

  if (diningCourt) {
    const menuNutrition = await DiningCourtService.getMenuNutrition(diningCourt)
    console.log(menuNutrition)
    const servingContext = DiningCourtService.getServingSizesContext(menuNutrition)
    const menuContext = Object.entries(servingContext)
      .map(([name, size]) => name + ": " + size)
      .join("\n")
    console.log(servingContext)
    const servingAnalysis = await LLMService.analyzeDiningCourtMeal(
      settings.openaiKey,
      imageDataUrl,
      menuContext,
      textDescription,
    )
    explaination = Object.entries(servingAnalysis.servings)
      .map(([key, value]) => `${value} x ${servingContext[key]} ${key}`)
      .join("\n")
    const nutrients = Object.entries(servingAnalysis.servings).reduce((acc, [key, value]) => {
      return DiningCourtService.addNutrients(
        acc,
        DiningCourtService.multiplyNutrients(menuNutrition[key], value),
      )
    }, {} as Nutrients)
    console.log(nutrients)
    analysis = { description: servingAnalysis.description, nutrients }
  } else {
    analysis = await LLMService.analyzeFood(settings.openaiKey, imageDataUrl, textDescription)
  }

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return { ...analysis, source: "openai", name: time + " " + diningCourt, explaination }
}
