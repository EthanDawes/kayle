import { localISODate } from "$lib/integrations/hfsGraphQL"
import type { Nutrients } from "$lib/models/meal"
import { MealRepository } from "$lib/repositories/MealRepository"
import {
  DiningCourtService,
  NUMERIC_NUTRIENT_LABELS,
  type NumericNutrientKey,
} from "$lib/services/DiningCourtService"
import { getNutrientBreakdown, type NutrientContribution } from "$lib/utils/nutrientBreakdown"

export interface NutrientTrendPoint {
  date: string
  label: string
  value: number
  hasMeals: boolean
  entries: NutrientContribution[]
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
    return this.forDays(nutrient, new Date(), 7)
  },

  async forDays(
    nutrient: NumericNutrientKey,
    endDate: Date,
    numDays: number = 7,
  ): Promise<NutrientTrendPoint[]> {
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)

    const start = addDays(end, -(numDays - 1))
    const meals = await MealRepository.getBetweenDates(localISODate(start), localISODate(end))
    const totalsByDate = new Map<string, Nutrients>()
    const entriesByDate = new Map<string, NutrientContribution[]>()
    const mealCountsByDate = new Map<string, number>()

    for (const meal of meals) {
      const current = totalsByDate.get(meal.date) ?? {}
      totalsByDate.set(meal.date, DiningCourtService.addNutrients(current, meal.nutrients))
      entriesByDate.set(meal.date, [
        ...(entriesByDate.get(meal.date) ?? []),
        ...getNutrientBreakdown([meal], nutrient),
      ])
      mealCountsByDate.set(meal.date, (mealCountsByDate.get(meal.date) ?? 0) + 1)
    }

    return Array.from({ length: numDays }, (_, index) => {
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

  async forMonths(
    nutrient: NumericNutrientKey,
    endMonthDate: Date,
    numMonths: number = 6,
  ): Promise<NutrientTrendPoint[]> {
    const end = new Date(endMonthDate)
    const startDate = new Date(end.getFullYear(), end.getMonth() - (numMonths - 1), 1)
    const endDate = new Date(end.getFullYear(), end.getMonth() + 1, 0)

    const meals = await MealRepository.getBetweenDates(
      localISODate(startDate),
      localISODate(endDate),
    )

    const totalsByDate = new Map<string, Nutrients>()
    const entriesByDate = new Map<string, NutrientContribution[]>()
    const mealCountsByDate = new Map<string, number>()

    for (const meal of meals) {
      const current = totalsByDate.get(meal.date) ?? {}
      totalsByDate.set(meal.date, DiningCourtService.addNutrients(current, meal.nutrients))
      entriesByDate.set(meal.date, [
        ...(entriesByDate.get(meal.date) ?? []),
        ...getNutrientBreakdown([meal], nutrient),
      ])
      mealCountsByDate.set(meal.date, (mealCountsByDate.get(meal.date) ?? 0) + 1)
    }

    const points: NutrientTrendPoint[] = []

    for (let i = 0; i < numMonths; i++) {
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
      const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0)

      const monthLabel = monthStart.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      })

      let sumDailyValues = 0
      let loggedDaysInMonth = 0
      const allEntriesInMonth: NutrientContribution[] = []

      const daysCount = monthEnd.getDate()
      for (let day = 1; day <= daysCount; day++) {
        const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
        const isoDate = localISODate(d)

        const hasMeals = (mealCountsByDate.get(isoDate) ?? 0) > 0
        if (hasMeals) {
          const nutrients = totalsByDate.get(isoDate) ?? {}
          sumDailyValues += nutrients[nutrient] ?? 0
          loggedDaysInMonth++

          const dailyEntries = entriesByDate.get(isoDate) ?? []
          allEntriesInMonth.push(...dailyEntries)
        }
      }

      // Group entries by food name and sum values, sorting descending and taking top 15
      const aggregatedMap = new Map<string, number>()
      for (const entry of allEntriesInMonth) {
        aggregatedMap.set(entry.name, (aggregatedMap.get(entry.name) ?? 0) + entry.value)
      }
      const sortedEntries = Array.from(aggregatedMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15)

      const hasMeals = loggedDaysInMonth > 0
      const averageValue = hasMeals ? sumDailyValues / loggedDaysInMonth : 0

      points.push({
        date: localISODate(monthStart),
        label: monthLabel,
        value: averageValue,
        hasMeals,
        entries: sortedEntries,
      })
    }

    return points
  },

  labelFor(nutrient: NumericNutrientKey): string {
    return NUMERIC_NUTRIENT_LABELS[nutrient]
  },
}
