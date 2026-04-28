import type { Nutrients } from "$lib/models/meal"

export interface OFFProduct {
  product_name: string
  brands?: string
  serving_size?: string
  servings_per_container?: number
  nutriments: {
    "energy-kcal_serving"?: number
    "energy-kcal_100g"?: number

    fat_serving?: number
    fat_100g?: number

    "saturated-fat_serving"?: number
    "saturated-fat_100g"?: number

    "trans-fat_serving"?: number
    "trans-fat_100g"?: number

    cholesterol_serving?: number
    cholesterol_100g?: number

    sodium_serving?: number
    sodium_100g?: number

    carbohydrates_serving?: number
    carbohydrates_100g?: number

    fiber_serving?: number
    fiber_100g?: number

    sugars_serving?: number
    sugars_100g?: number

    "added-sugars_serving"?: number
    "added-sugars_100g"?: number

    proteins_serving?: number
    proteins_100g?: number

    "vitamin-d_serving"?: number
    "vitamin-d_100g"?: number

    "vitamin-c_serving"?: number
    "vitamin-c_100g"?: number

    calcium_serving?: number
    calcium_100g?: number

    iron_serving?: number
    iron_100g?: number

    potassium_serving?: number
    potassium_100g?: number
  }
}

export async function fetchProduct(barcode: string, apiKey?: string): Promise<OFFProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,nutriments,serving_size,servings_per_container`
  const headers: Record<string, string> = {
    "User-Agent": "Kayle-NutritionApp/1.0 (ethan.d.python@gmail.com)",
  }

  if (apiKey) headers.Authorization = `Bearer ${apiKey}`

  const res = await fetch(url, { headers })
  if (!res.ok) return null

  const data = await res.json()
  if (data.status !== 1) return null

  return data.product as OFFProduct
}

const pick = (
  nutriments: OFFProduct["nutriments"],
  servingKey: keyof OFFProduct["nutriments"],
  per100gKey: keyof OFFProduct["nutriments"],
) => nutriments[servingKey] ?? nutriments[per100gKey]

export function mapOFFNutrients(product: OFFProduct): Nutrients {
  const n = product.nutriments

  return {
    servingSize: product.serving_size,
    servingsPerContainer: product.servings_per_container,
    calories: pick(n, "energy-kcal_serving", "energy-kcal_100g"),
    totalFat: pick(n, "fat_serving", "fat_100g"),
    saturatedFat: pick(n, "saturated-fat_serving", "saturated-fat_100g"),
    transFat: pick(n, "trans-fat_serving", "trans-fat_100g"),
    cholesterol: pick(n, "cholesterol_serving", "cholesterol_100g"),
    sodium: pick(n, "sodium_serving", "sodium_100g"),
    totalCarbohydrate: pick(n, "carbohydrates_serving", "carbohydrates_100g"),
    dietaryFiber: pick(n, "fiber_serving", "fiber_100g"),
    totalSugars: pick(n, "sugars_serving", "sugars_100g"),
    addedSugars: pick(n, "added-sugars_serving", "added-sugars_100g"),
    protein: pick(n, "proteins_serving", "proteins_100g"),
    vitaminD: pick(n, "vitamin-d_serving", "vitamin-d_100g"),
    vitaminC: pick(n, "vitamin-c_serving", "vitamin-c_100g"),
    calcium: pick(n, "calcium_serving", "calcium_100g"),
    iron: pick(n, "iron_serving", "iron_100g"),
    potassium: pick(n, "potassium_serving", "potassium_100g"),
  }
}
