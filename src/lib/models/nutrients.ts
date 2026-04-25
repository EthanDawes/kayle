import { MG } from "$lib"
import type { Nutrients } from "$lib/models/meal"

export const NUTRIENT_KEYS = [
  "calories",
  "totalFat",
  "saturatedFat",
  "transFat",
  "cholesterol",
  "sodium",
  "totalCarbohydrate",
  "dietaryFiber",
  "totalSugars",
  "addedSugars",
  "protein",
  "vitaminD",
  "vitaminC",
  "calcium",
  "iron",
  "potassium",
] as const satisfies readonly (keyof Nutrients)[]

export type NutrientKey = (typeof NUTRIENT_KEYS)[number]

type SourceNutrient = {
  name?: string | null
  label?: string | null
  value?: number | null
}

export interface MenuItemNutrition {
  nutrients: Nutrients
  servingSize?: string
}

const HFS_TO_NUTRIENT_KEY: Record<string, NutrientKey> = {
  calories: "calories",
  "total fat": "totalFat",
  "saturated fat": "saturatedFat",
  "trans fat": "transFat",
  cholesterol: "cholesterol",
  sodium: "sodium",
  "total carbohydrate": "totalCarbohydrate",
  "dietary fiber": "dietaryFiber",
  sugar: "totalSugars",
  "total sugars": "totalSugars",
  "added sugar": "addedSugars",
  "added sugars": "addedSugars",
  protein: "protein",
  "vitamin d": "vitaminD",
  "vitamin c": "vitaminC",
  calcium: "calcium",
  iron: "iron",
  potassium: "potassium",
}

const MILLIGRAM_NUTRIENTS = new Set<NutrientKey>([
  "cholesterol",
  "sodium",
  "calcium",
  "iron",
  "potassium",
  "vitaminC",
  "vitaminD",
])

function normalizeNutrientValue(key: NutrientKey, value: number): number {
  if (key === "calories") return value
  if (MILLIGRAM_NUTRIENTS.has(key)) return value * MG
  return value
}

export function scaleNutrients(nutrients: Nutrients | undefined, scalar: number): Nutrients {
  if (!nutrients) return {}

  return Object.fromEntries(
    NUTRIENT_KEYS.flatMap((key) => {
      const value = nutrients[key]
      return value == null ? [] : [[key, value * scalar]]
    }),
  ) as Nutrients
}

export function sumNutrients(items: Nutrients[]): Nutrients {
  return items.reduce<Nutrients>((total, nutrients) => {
    for (const key of NUTRIENT_KEYS) {
      const value = nutrients[key]
      if (value != null) total[key] = (total[key] ?? 0) + value
    }
    return total
  }, {})
}

export function fromHfsNutritionFacts(facts: SourceNutrient[]): MenuItemNutrition {
  const result: MenuItemNutrition = { nutrients: {} }

  for (const fact of facts) {
    const name = fact.name?.toLowerCase()
    if (!name) continue

    if (name === "serving size") {
      result.servingSize = fact.label ?? undefined
      continue
    }

    const key = HFS_TO_NUTRIENT_KEY[name]
    if (!key || fact.value == null) continue

    result.nutrients[key] = normalizeNutrientValue(key, fact.value)
  }

  return result
}
