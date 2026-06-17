import type { NumericNutrientKey } from "$lib/services/DiningCourtService"
import { MG, MCG } from "$lib"

export type NutrientUnit = "g" | "mg" | "mcg" | "kcal"

const NUTRIENT_UNITS: Record<NumericNutrientKey, NutrientUnit> = {
  calories: "kcal",
  totalFat: "g",
  saturatedFat: "g",
  transFat: "g",
  cholesterol: "mg",
  sodium: "mg",
  totalCarbohydrate: "g",
  dietaryFiber: "g",
  totalSugars: "g",
  addedSugars: "g",
  protein: "g",
  vitaminD: "mcg",
  vitaminC: "mg",
  calcium: "mg",
  iron: "mg",
  potassium: "mg",
}

export function getNutrientUnit(nutrient: NumericNutrientKey): NutrientUnit {
  return NUTRIENT_UNITS[nutrient]
}

export function scaleNutrientValue(nutrient: NumericNutrientKey, value: number): number {
  const unit = getNutrientUnit(nutrient)

  if (unit === "mg") return value / MG
  if (unit === "mcg") return value / MCG
  return value
}

export function unscaleNutrientValue(nutrient: NumericNutrientKey, value: number): number {
  const unit = getNutrientUnit(nutrient)

  if (unit === "mg") return value * MG
  if (unit === "mcg") return value * MCG
  return value
}

export function formatNutrientValue(nutrient: NumericNutrientKey, value: number): string {
  return `${Math.round(scaleNutrientValue(nutrient, value))} ${getNutrientUnit(nutrient)}`
}
