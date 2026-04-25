import { MealRepository } from "$lib/repositories/MealRepository"
import type { Meal, Nutrients } from "$lib/models/meal"
import { DiningCourtService } from "$lib/services/DiningCourtService"

export interface DayOverview {
  meals: Meal[]
  nutrients: Nutrients
}

export const DayOverviewQuery = {
  async forDate(date: string): Promise<DayOverview> {
    const meals = await MealRepository.getByDate(date)
    const summary = meals.reduce(
      (sum, meal) => DiningCourtService.addNutrients(sum, meal.nutrients),
      {} as Nutrients,
    )

    return {
      meals,
      nutrients: summary,
    }
  },

  today(): string {
    return new Date().toISOString().split("T")[0]
  },
}
