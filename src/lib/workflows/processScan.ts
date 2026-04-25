import { processBarcode } from "./processBarcode"
import { processFoodPhoto } from "./processFoodPhoto"
import type { NutritionInfo } from "$lib/models/meal"

type ScanMode = "food" | "barcode"

const processors = {
  barcode: processBarcode,
  food: processFoodPhoto,
}

export async function processScan(
  imageDataUrl: string,
  mode: ScanMode,
  court: string | undefined,
): Promise<NutritionInfo> {
  return processors[mode](imageDataUrl, court)
}
