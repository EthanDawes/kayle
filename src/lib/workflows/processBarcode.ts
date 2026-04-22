import { BarcodeService } from "$lib/services/BarcodeService"
import { fetchProduct } from "$lib/integrations/openfoodfacts"
import { settings } from "$lib/stores/settings.svelte"
import type { NutritionInfo } from "$lib/models/meal"

export async function processBarcode(imageDataUrl: string): Promise<NutritionInfo> {
  const barcode = await BarcodeService.detect(imageDataUrl)
  if (!barcode) throw new Error("No barcode detected. Try holding the camera steady and closer.")

  const product = await fetchProduct(barcode, settings.openfoodfactsKey || undefined)
  if (!product) throw new Error(`No product found for barcode ${barcode}.`)

  const n = product.nutriments
  return {
    name: product.product_name || "Unknown Product",
    calories: n["energy-kcal_serving"] ?? n["energy-kcal_100g"],
    protein: n.proteins_serving ?? n.proteins_100g,
    fat: n.fat_serving ?? n.fat_100g,
    carbs: n.carbohydrates_serving ?? n.carbohydrates_100g,
    servingSize: product.serving_size,
    brand: product.brands,
    source: "openfoodfacts",
  }
}
