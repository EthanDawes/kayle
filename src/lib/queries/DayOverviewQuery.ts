import { MealRepository } from "$lib/repositories/MealRepository"
import type { Meal } from "$lib/models/meal"

export interface DayOverview {
  meals: Meal[]
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  mealCount: number
}

export const DayOverviewQuery = {
  async forDate(date: string): Promise<DayOverview> {
    const meals = await MealRepository.getByDate(date)
    return {
      meals,
      totalCalories: meals.reduce((s, m) => s + (m.calories ?? 0), 0),
      totalProtein: meals.reduce((s, m) => s + (m.protein ?? 0), 0),
      totalFat: meals.reduce((s, m) => s + (m.fat ?? 0), 0),
      totalCarbs: meals.reduce((s, m) => s + (m.carbs ?? 0), 0),
      mealCount: meals.length,
    }
  },

  today(): string {
    return new Date().toISOString().split("T")[0]
  },
}
