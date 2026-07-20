import Dexie, { type Table } from "dexie"
import type { ExportedMeal, Meal } from "$lib/models/meal"

class KayleDB extends Dexie {
  meals!: Table<Meal, number>

  constructor() {
    super("kayle")
    this.version(1).stores({ meals: "++id, date" })
  }
}

const db = new KayleDB()

export const MealRepository = {
  add(meal: Omit<Meal, "id">): Promise<number> {
    return db.meals.add(meal as Meal)
  },

  getByDate(date: string): Promise<Meal[]> {
    return db.meals.where("date").equals(date).toArray()
  },

  getBetweenDates(startDate: string, endDate: string): Promise<Meal[]> {
    return db.meals.where("date").between(startDate, endDate, true, true).toArray()
  },

  delete(id: number): Promise<void> {
    return db.meals.delete(id)
  },

  async getWeek() {
    const weekAgo = new Date()
    weekAgo.setHours(0, 0, 0, 0)
    weekAgo.setDate(weekAgo.getDate() - 8) // 'above' is non-inclusive
    return (await db.meals.where("date").above(weekAgo.toISOString().split("T")[0]).toArray())
      .flatMap<{ name: string }>((meal) => meal.components ?? meal)
      .map((meal) => meal.name)
  },

  async getExport(): Promise<ExportedMeal[]> {
    const output: ExportedMeal[] = []
    for (const meal of await db.meals.toArray()) {
      if (meal.components) {
        output.push(
          ...meal.components.map((component) => ({ ...component, date: new Date(meal.timestamp) })),
        )
      } else {
        output.push({
          name: meal.name,
          baseNutrients: meal.nutrients,
          servingSize: "all",
          servings: 1,
          date: new Date(meal.timestamp),
        })
      }
    }
    return output
  },
}
