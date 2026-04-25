import { DiningCourtService } from "$lib/services/DiningCourtService"
import { requestJsonFromImage } from "$lib/integrations/openai"
import { scaleNutrients, sumNutrients, type MenuItemNutrition } from "$lib/models/nutrients"
import { settings } from "$lib/stores/settings.svelte"
import type { Nutrients, NutritionInfo } from "$lib/models/meal"

interface ProcessFoodPhotoOptions {
  diningCourt?: string
}

type DirectFoodPhotoResponse = {
  name?: string
  description?: string
  nutrients: Nutrients
}

type DiningCourtServingResponse = {
  servings: Record<string, number>
  description?: string
}

function buildDirectFoodPrompt(): string {
  return [
    "Analyze the food in this image. Return a JSON object with this shape:",
    `
{
  name: string (short meal name)
  description: string (one short sentence)
  // All nutrient units are in grams, except calories.
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
}`,
    "\nReturn only valid JSON, no markdown fences.",
  ].join("\n")
}

function buildDiningCourtPrompt(menuNutrition: Record<string, MenuItemNutrition>): string {
  const menuContext = Object.entries(menuNutrition)
    .map(([name, item]) => `${name}: ${item.servingSize ?? "1 serving"}`)
    .join("\n")

  return [
    "Here are menu items and their serving sizes:",
    menuContext,
    "",
    "Analyze the food in this image. Return a JSON object with this shape:",
    "{servings: map of exact menu item names to serving-size multiples, description: string (one short sentence)}",
    "Only include items from the provided menu list.",
    "Return only valid JSON, no markdown fences.",
  ].join("\n")
}

function nutrientsFromServings(
  menuNutrition: Record<string, MenuItemNutrition>,
  servings: Record<string, number>,
): Nutrients {
  return sumNutrients(
    Object.entries(servings).flatMap(([name, servingCount]) => {
      const item = menuNutrition[name]
      if (!item || !Number.isFinite(servingCount)) return []
      return [scaleNutrients(item.nutrients, servingCount)]
    }),
  )
}

export async function processFoodPhoto(
  imageDataUrl: string,
  options: ProcessFoodPhotoOptions = {},
): Promise<NutritionInfo> {
  if (!settings.hasOpenai) {
    throw new Error("OpenAI API key not set. Go to Settings to add your key.")
  }

  if (!options.diningCourt) {
    const analysis = await requestJsonFromImage<DirectFoodPhotoResponse>(
      settings.openaiKey,
      imageDataUrl,
      buildDirectFoodPrompt(),
    )

    return {
      name: analysis.name ?? "Meal",
      description: analysis.description,
      nutrients: analysis.nutrients,
      source: "openai",
    }
  }

  const menuNutrition = await DiningCourtService.getMenuNutrition(options.diningCourt)
  const analysis = await requestJsonFromImage<DiningCourtServingResponse>(
    settings.openaiKey,
    imageDataUrl,
    buildDiningCourtPrompt(menuNutrition),
  )

  return {
    name: analysis.description ?? "Dining Court Meal",
    description: analysis.description,
    nutrients: nutrientsFromServings(menuNutrition, analysis.servings),
    source: "openai",
  }
}
