import { localISODate } from "$lib/integrations/hfsGraphQL"
import type { Meal, Nutrients } from "$lib/models/meal"
import { MealRepository } from "$lib/repositories/MealRepository"
import {
  DiningCourtService,
  NUMERIC_NUTRIENT_LABELS,
  type NumericNutrientKey,
} from "$lib/services/DiningCourtService"

export interface NutrientTrendEntry {
  name: string
  value: number
}

export interface NutrientTrendPoint {
  date: string
  label: string
  value: number
  hasMeals: boolean
  entries: NutrientTrendEntry[]
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function formatLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  })
}

function entriesForMeal(meal: Meal, nutrient: NumericNutrientKey): NutrientTrendEntry[] {
  if (meal.components?.length) {
    return meal.components.map((component) => ({
      name: component.name,
      value: (component.baseNutrients[nutrient] ?? 0) * component.servings,
    }))
  }

  return [
    {
      name: meal.name,
      value: meal.nutrients[nutrient] ?? 0,
    },
  ]
}

export const NutrientTrendsQuery = {
  async forPastWeek(nutrient: NumericNutrientKey): Promise<NutrientTrendPoint[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const start = addDays(today, -6)
    const meals = await MealRepository.getBetweenDates(localISODate(start), localISODate(today))
    const totalsByDate = new Map<string, Nutrients>()
    const entriesByDate = new Map<string, NutrientTrendEntry[]>()
    const mealCountsByDate = new Map<string, number>()

    for (const meal of meals) {
      const current = totalsByDate.get(meal.date) ?? {}
      totalsByDate.set(meal.date, DiningCourtService.addNutrients(current, meal.nutrients))
      entriesByDate.set(meal.date, [
        ...(entriesByDate.get(meal.date) ?? []),
        ...entriesForMeal(meal, nutrient),
      ])
      mealCountsByDate.set(meal.date, (mealCountsByDate.get(meal.date) ?? 0) + 1)
    }

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index)
      const isoDate = localISODate(date)
      const nutrients = totalsByDate.get(isoDate) ?? {}
      const entries = [...(entriesByDate.get(isoDate) ?? [])].sort((a, b) => b.value - a.value)

      return {
        date: isoDate,
        label: formatLabel(date),
        value: nutrients[nutrient] ?? 0,
        hasMeals: (mealCountsByDate.get(isoDate) ?? 0) > 0,
        entries,
      }
    })
  },

  labelFor(nutrient: NumericNutrientKey): string {
    return NUMERIC_NUTRIENT_LABELS[nutrient]
  },
}
