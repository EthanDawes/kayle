import { DiningCourtService } from "$lib/services/DiningCourtService"
import { LLMService } from "$lib/services/LLMService"
import { settings } from "$lib/stores/settings.svelte"
import type { MealComponent, Nutrients, NutritionInfo } from "$lib/models/meal"

export async function processFoodPhoto(
  imageDataUrl: string | undefined,
  diningCourt?: string,
  textDescription?: string,
): Promise<NutritionInfo> {
  if (!settings.hasOpenai) {
    throw new Error("OpenAI API key not set. Go to Settings to add your key.")
  }

  let nutrients: Nutrients
  let components: MealComponent[] | undefined

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

    components = Object.entries(servingAnalysis.servings).map(([name, servings]) => ({
      name,
      servings,
      servingSize: servingContext[name] ?? "",
      baseNutrients: { ...menuNutrition[name] },
    }))

    nutrients = components.reduce((acc, comp) => {
      return DiningCourtService.addNutrients(
        acc,
        DiningCourtService.multiplyNutrients({ ...comp.baseNutrients }, comp.servings),
      )
    }, {} as Nutrients)
    console.log(nutrients)
  } else {
    nutrients = await LLMService.analyzeFood(settings.openaiKey, imageDataUrl, textDescription)
  }

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return { nutrients, source: "openai", name: diningCourt ?? textDescription ?? "Meal", components }
}
