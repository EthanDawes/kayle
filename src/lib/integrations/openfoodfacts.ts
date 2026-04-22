export interface OFFProduct {
  product_name: string
  brands?: string
  serving_size?: string
  nutriments: {
    "energy-kcal_serving"?: number
    "energy-kcal_100g"?: number
    proteins_serving?: number
    proteins_100g?: number
    fat_serving?: number
    fat_100g?: number
    carbohydrates_serving?: number
    carbohydrates_100g?: number
  }
}

export async function fetchProduct(barcode: string, apiKey?: string): Promise<OFFProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
  const headers: Record<string, string> = {
    "User-Agent": "Kayle-NutritionApp/1.0 (ethan.d.python@gmail.com)",
  }
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`

  const res = await fetch(url, { headers })
  if (!res.ok) return null

  const data = await res.json()
  if (data.status !== 1) return null

  return data.product as OFFProduct
}
