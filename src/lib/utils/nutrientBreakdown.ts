import type { Meal } from "$lib/models/meal"
import type { NumericNutrientKey } from "$lib/services/DiningCourtService"

export interface NutrientContribution {
  name: string
  value: number
}

function contributionsForMeal(meal: Meal, nutrient: NumericNutrientKey): NutrientContribution[] {
  if (meal.components?.length) {
    return meal.components
      .map((component) => ({
        name: component.name,
        value: (component.baseNutrients[nutrient] ?? 0) * component.servings,
      }))
      .filter((entry) => entry.value > 0)
  }

  const value = meal.nutrients[nutrient] ?? 0
  return value > 0 ? [{ name: meal.name, value }] : []
}

export function getNutrientBreakdown(
  meals: Meal[],
  nutrient: NumericNutrientKey,
): NutrientContribution[] {
  return meals
    .flatMap((meal) => contributionsForMeal(meal, nutrient))
    .sort((a, b) => b.value - a.value)
}
