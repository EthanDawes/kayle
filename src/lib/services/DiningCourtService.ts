import { getMenu } from "$lib/integrations/hfsGraphQL"
import { fromHfsNutritionFacts, type MenuItemNutrition } from "$lib/models/nutrients"
import type { Coordinates } from "./LocationService"

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

export const DiningCourtService = {
  async getMenuNutrition(courtName: string): Promise<Record<string, MenuItemNutrition>> {
    const menuItems = await getMenu(courtName).catch(() => [])

    return Object.fromEntries(
      menuItems.map((item) => [item.name, fromHfsNutritionFacts(item.nutritionFacts ?? [])]),
    )
  },

  async getNearestCourt(locations: DiningLocation[], coords: Coordinates): Promise<string> {
    if (!locations.length) return ""

    return locations.reduce((a, b) => (distance(coords, a) < distance(coords, b) ? a : b)).name!
  },
}
