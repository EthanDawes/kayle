import { processBarcode } from "./processBarcode"
import { processFoodPhoto } from "./processFoodPhoto"
import type { NutritionInfo } from "$lib/models/meal"
import type { MealDescriptor } from "$lib/services/DiningCourtService"

type ScanMode = "food" | "barcode"

const processors = {
  barcode: processBarcode,
  food: processFoodPhoto,
} as const

export async function processScan(
  imageDataUrl: string,
  mode: ScanMode,
  court: MealDescriptor | undefined,
): Promise<NutritionInfo> {
  if (mode === "food") {
    return processFoodPhoto(imageDataUrl, court)
  }
  return processBarcode(imageDataUrl)
}
