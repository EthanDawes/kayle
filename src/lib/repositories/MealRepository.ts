import Dexie, { type Table } from "dexie"
import "dexie-export-import"
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

  async reassignDate(id: number, date: string): Promise<void> {
    const meal = await db.meals.get(id)
    if (!meal) return

    const currentTimestamp = new Date(meal.timestamp)
    const reassignedTimestamp = new Date(`${date}T00:00:00`)
    reassignedTimestamp.setHours(
      currentTimestamp.getHours(),
      currentTimestamp.getMinutes(),
      currentTimestamp.getSeconds(),
      currentTimestamp.getMilliseconds(),
    )

    await db.meals.update(id, { date, timestamp: reassignedTimestamp.getTime() })
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

  exportDump(): Promise<Blob> {
    return db.export({ prettyJson: true })
  },

  importDump(file: Blob): Promise<void> {
    return db.import(file, { clearTablesBeforeImport: true, overwriteValues: true })
  },
}
