import { localISODate } from "$lib/integrations/hfsGraphQL"
import type { Nutrients } from "$lib/models/meal"
import { MealRepository } from "$lib/repositories/MealRepository"
import {
  DiningCourtService,
  NUMERIC_NUTRIENT_LABELS,
  type NumericNutrientKey,
} from "$lib/services/DiningCourtService"

export interface NutrientTrendPoint {
  date: string
  label: string
  value: number
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

export const NutrientTrendsQuery = {
  async forPastWeek(nutrient: NumericNutrientKey): Promise<NutrientTrendPoint[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const start = addDays(today, -6)
    const meals = await MealRepository.getBetweenDates(localISODate(start), localISODate(today))
    const totalsByDate = new Map<string, Nutrients>()

    for (const meal of meals) {
      const current = totalsByDate.get(meal.date) ?? {}
      totalsByDate.set(meal.date, DiningCourtService.addNutrients(current, meal.nutrients))
    }

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index)
      const isoDate = localISODate(date)
      const nutrients = totalsByDate.get(isoDate) ?? {}

      return {
        date: isoDate,
        label: formatLabel(date),
        value: nutrients[nutrient] ?? 0,
      }
    })
  },

  labelFor(nutrient: NumericNutrientKey): string {
    return NUMERIC_NUTRIENT_LABELS[nutrient]
  },
}
