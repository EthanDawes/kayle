import Dexie, { type Table } from "dexie"
import type { Meal } from "$lib/models/meal"

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

  delete(id: number): Promise<void> {
    return db.meals.delete(id)
  },
}
