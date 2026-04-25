import { processBarcode } from "./processBarcode"
import { processFoodPhoto } from "./processFoodPhoto"
import type { NutritionInfo } from "$lib/models/meal"

type ScanMode = "food" | "barcode"

interface ProcessScanOptions {
  diningCourt?: string
}

export async function processScan(
  imageDataUrl: string,
  mode: ScanMode,
  options: ProcessScanOptions = {},
): Promise<NutritionInfo> {
  if (mode === "barcode") return processBarcode(imageDataUrl)
  return processFoodPhoto(imageDataUrl, { diningCourt: options.diningCourt })
}
