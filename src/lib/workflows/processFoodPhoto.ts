import { LocationService } from "$lib/services/LocationService"
import { DiningCourtService } from "$lib/services/DiningCourtService"
import { LLMService } from "$lib/services/LLMService"
import { settings } from "$lib/stores/settings.svelte"
import type { NutritionInfo } from "$lib/models/meal"

export async function processFoodPhoto(imageDataUrl: string): Promise<NutritionInfo> {
  if (!settings.hasOpenai) {
    throw new Error("OpenAI API key not set. Go to Settings to add your key.")
  }

  let menuContext: string | undefined

  // Location + dining context is best-effort — failures are silent
  try {
    const coords = await LocationService.get()
    const ctx = await DiningCourtService.getNearestMenuContext(coords)
    if (ctx) menuContext = ctx
  } catch {
    // geolocation denied or HFS unavailable — proceed without context
  }

  const analysis = await LLMService.analyzeFood(settings.openaiKey, imageDataUrl, menuContext)

  return { ...analysis, source: "openai" }
}
