import { BarcodeService } from "$lib/services/BarcodeService"
import { fetchProduct, mapOFFNutrients } from "$lib/integrations/openfoodfacts"
import { settings } from "$lib/stores/settings.svelte"
import type { NutritionInfo } from "$lib/models/meal"

export async function processBarcode(imageDataUrl: string): Promise<NutritionInfo> {
  const barcode = await BarcodeService.detect(imageDataUrl)
  if (!barcode) throw new Error("No barcode detected. Try holding the camera steady and closer.")

  const product = await fetchProduct(barcode, settings.openfoodfactsKey || undefined)
  if (!product) throw new Error(`No product found for barcode ${barcode}.`)

  return {
    name: product.product_name || "Unknown Product",
    nutrients: mapOFFNutrients(product),
    source: "openfoodfacts",
  }
}
