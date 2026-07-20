import { MG } from "$lib"
import { getLocations, getMenu } from "$lib/integrations/hfsGraphQL"
import type { Nutrients } from "$lib/models/meal"
import type { Coordinates } from "./LocationService"

export type FoodNutrients = Record<string, Nutrients>
export type NumericNutrientKey = Exclude<keyof Nutrients, "servingSize" | "servingsPerContainer">
export const NUMERIC_NUTRIENT_KEYS = [
  "calories",
  "totalFat",
  "saturatedFat",
  "transFat",
  "cholesterol",
  "sodium",
  "totalCarbohydrate",
  "dietaryFiber",
  "totalSugars",
  "addedSugars",
  "protein",
  "vitaminD",
  "vitaminC",
  "calcium",
  "iron",
  "potassium",
] as const satisfies NumericNutrientKey[]

export interface MealDescriptor {
  // As ISO date yyyy-mm-dd
  date: string
  // hh:mm (24-hour). Replaced period name in favor of time, since it may not be obvious that Lawson requires "Breakfast/Lunch" period
  time: string
  // Dining court name, not meal period name
  name: string
}

export const NUMERIC_NUTRIENT_LABELS = {
  calories: "Calories",
  totalFat: "Total Fat",
  saturatedFat: "Saturated Fat",
  transFat: "Trans Fat",
  cholesterol: "Cholesterol",
  sodium: "Sodium",
  totalCarbohydrate: "Total Carbohydrate",
  dietaryFiber: "Dietary Fiber",
  totalSugars: "Total Sugars",
  addedSugars: "Added Sugars",
  protein: "Protein",
  vitaminD: "Vitamin D",
  vitaminC: "Vitamin C",
  calcium: "Calcium",
  iron: "Iron",
  potassium: "Potassium",
} as const satisfies Record<NumericNutrientKey, string>

interface DiningLocation {
  latitude: number
  longitude: number
  name: string
  category?: string
}

export const MAX_AUTO_SELECT_DISTANCE_METERS = 250

function distance(a: Coordinates, b: DiningLocation): number {
  const R = 6_371_000
  const φ1 = (a.latitude * Math.PI) / 180
  const φ2 = (b.latitude * Math.PI) / 180
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180
  const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

type SourceNutrient = {
  name?: string | null
  label?: string | null
  value?: number | null
}

const asGrams = (name: string, value: number): number => {
  const lower = name.toLowerCase()

  // Common FDA label nutrients usually expressed in mg
  if (
    ["cholesterol", "sodium", "calcium", "iron", "potassium", "vitamin c", "vitamin d"].includes(
      lower,
    )
  ) {
    return value * MG
  }

  // Everything else expected already in grams
  return value
}

export const toNutrients = (items: SourceNutrient[]): Nutrients =>
  items.reduce<Nutrients>((acc, item) => {
    if (item.name?.toLowerCase() === "serving size") {
      acc.servingSize = item.label!
    }
    if (item.name == null || item.value == null) return acc

    const v = item.name.toLowerCase() === "calories" ? item.value : asGrams(item.name, item.value)

    switch (item.name.toLowerCase()) {
      case "calories":
        acc.calories = v
        break
      case "total fat":
        acc.totalFat = v
        break
      case "saturated fat":
        acc.saturatedFat = v
        break
      case "trans fat":
        acc.transFat = v
        break
      case "cholesterol":
        acc.cholesterol = v
        break
      case "sodium":
        acc.sodium = v
        break
      case "total carbohydrate":
        acc.totalCarbohydrate = v
        break
      case "dietary fiber":
        acc.dietaryFiber = v
        break
      case "sugar":
      case "total sugars":
        acc.totalSugars = v
        break
      case "added sugar":
      case "added sugars":
        acc.addedSugars = v
        break
      case "protein":
        acc.protein = v
        break
      case "vitamin d":
        acc.vitaminD = v
        break
      case "vitamin c":
        acc.vitaminC = v
        break
      case "calcium":
        acc.calcium = v
        break
      case "iron":
        acc.iron = v
        break
      case "potassium":
        acc.potassium = v
        break
    }

    return acc
  }, {})

export const DiningCourtService = {
  async getMenuNutrition(court: MealDescriptor): Promise<FoodNutrients> {
    const menuItems = await getMenu(court).catch(() => [])

    return Object.fromEntries(
      menuItems.map((item) => [item.name, toNutrients(item.nutritionFacts ?? [])]),
    )
  },

  getServingSizesContext(menuNutrition: FoodNutrients): Record<string, string> {
    return Object.fromEntries(
      Object.entries(menuNutrition).map(([name, { servingSize }]) => [name, servingSize!]),
    )
  },

  multiplyNutrients(nutrients: Nutrients, scalar: number) {
    for (const key of NUMERIC_NUTRIENT_KEYS) {
      if (nutrients[key] != null) nutrients[key] *= scalar
    }
    return nutrients
  },

  addNutrients(nut1: Nutrients, nut2: Nutrients) {
    for (const key of NUMERIC_NUTRIENT_KEYS) {
      const value = (nut1[key] ?? 0) + (nut2[key] ?? 0)
      if (value !== 0) nut1[key] = value
    }
    return nut1
  },

  async getNearestCourt(
    locations: DiningLocation[],
    coords: Coordinates,
    maxDistanceMeters = Number.POSITIVE_INFINITY,
  ): Promise<string> {
    if (!locations.length) return ""

    const nearest = locations.reduce((a, b) => {
      const da = distance(coords, a)
      const db = distance(coords, b)
      if (da !== db) return da < db ? a : b
      // Break ties by preferring "Dining Courts" category
      if (a.category === "Dining Courts") return a
      if (b.category === "Dining Courts") return b
      return a
    })

    return distance(coords, nearest) <= maxDistanceMeters ? nearest.name! : ""
  },
}
