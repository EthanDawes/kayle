import { DiningCourtService, type MealDescriptor } from "$lib/services/DiningCourtService"
import { LLMService } from "$lib/services/LLMService"
import { settings } from "$lib/stores/settings.svelte"
import type { MealComponent, Nutrients, NutritionInfo } from "$lib/models/meal"

export async function processFoodPhoto(
  imageDataUrl: string | undefined,
  diningCourt?: MealDescriptor,
  textDescription?: string,
): Promise<NutritionInfo> {
  if (!settings.hasOpenrouter) {
    throw new Error("OpenRouter API key not set. Go to Settings to add your key.")
  }

  let nutrients: Nutrients
  let components: MealComponent[] | undefined

  if (diningCourt?.name) {
    const menuNutrition = await DiningCourtService.getMenuNutrition(diningCourt)
    console.log(menuNutrition)
    const servingContext = DiningCourtService.getServingSizesContext(menuNutrition)
    const menuContext = Object.entries(servingContext)
      .map(([name, size]) => name + ": " + size)
      .join("\n")
    console.log(servingContext)
    const servingAnalysis = await LLMService.analyzeDiningCourtMeal(
      settings.openrouterKey,
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

    // Add any food items that were not on the menu (ex. limited time items)
    // TODO: I _could_ have a cache of all the possible old dining court menus, but that seems like more work than it's worth, considering how uncommon that is
    if (servingAnalysis.unknowns?.length > 0) {
      const unknownsDescription = servingAnalysis.unknowns.join(", ")
      const unknownsNutrients = (await processFoodPhoto(undefined, undefined, unknownsDescription))
        .nutrients
      components.push({
        name: unknownsDescription,
        servings: 1,
        servingSize: "combined",
        baseNutrients: unknownsNutrients,
      })
    }

    nutrients = components.reduce((acc, comp) => {
      return DiningCourtService.addNutrients(
        acc,
        DiningCourtService.multiplyNutrients({ ...comp.baseNutrients }, comp.servings),
      )
    }, {} as Nutrients)
    console.log(nutrients)
  } else {
    const res = await LLMService.analyzeFood(settings.openrouterKey, imageDataUrl, textDescription)
    nutrients = res.nutrients
    textDescription = res.title
  }

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return {
    nutrients,
    source: "openai",
    name: (diningCourt?.name || textDescription) ?? "Meal",
    components,
  }
}
