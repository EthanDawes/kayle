import { getLocations, getMenu } from "$lib/integrations/hfsGraphQL"
import type { Coordinates } from "./LocationService"

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
  async getNearestMenuContext(coords: Coordinates): Promise<string> {
    const locations = await getLocations()
    if (!locations.length) return ""

    const nearest = locations.reduce((a, b) => (distance(coords, a) < distance(coords, b) ? a : b))

    const menuItems = await getMenu(nearest.name).catch(() => [])

    // AI model doesn't care about dining court name
    if (!menuItems.length) return ""

    const items = menuItems.map(
      (item) =>
        item.name +
        ": " +
        (item.nutritionFacts?.find((fact) => fact.name === "Serving Size")?.label ?? ""),
    )

    return items.join("\n")
  },
}
