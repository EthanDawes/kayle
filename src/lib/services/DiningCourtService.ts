import { MG } from "$lib"
import { getLocations, getMenu } from "$lib/integrations/hfsGraphQL"
import type { Nutrients } from "$lib/models/meal"
import type { Coordinates } from "./LocationService"

export type FoodNutrients = Record<string, Nutrients>

interface DiningLocation {
  latitude: number
  longitude: number
  name: string
}

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
    if (item.value == null) return acc

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
  async getMenuNutrition(courtName: string): Promise<FoodNutrients> {
    const menuItems = await getMenu(courtName).catch(() => [])

    return Object.fromEntries(
      menuItems.map((item) => [item.name, toNutrients(item.nutritionFacts ?? [])]),
    )
  },

  getServingSizesContext(menuNutrition: FoodNutrients): string {
    return Object.entries(menuNutrition)
      .map(([name, { servingSize }]) => name + ": " + servingSize!)
      .join("\n")
  },

  multiplyNutrients(nutrients: Nutrients, scalar: number) {
    for (let key in nutrients) {
      if (key != "servingSize") nutrients[k] = nutrients[k]! * scalar
    }
    return nutrients
  },

  addNutrients(nut1: Nutrients, nut2: Nutrients) {
    for (const key in nut1) {
      if (key != "servingSize") nut1[key] = (nut1[key] ?? 0) + (nut2[key] ?? 0)
    }
    return nut1
  },

  async getNearestCourt(locations: DiningLocation[], coords: Coordinates): Promise<string> {
    if (!locations.length) return ""

    return locations.reduce((a, b) => (distance(coords, a) < distance(coords, b) ? a : b)).name!
  },
}
