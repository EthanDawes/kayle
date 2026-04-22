import { getLocations, getMenus, type DiningLocation } from "$lib/integrations/hfsGraphQL"
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

    const today = new Date().toISOString().split("T")[0]
    const menus = await getMenus(nearest.name, today).catch(() => [])

    if (!menus.length) return `Nearest dining court: ${nearest.name}`

    const items = menus
      .flatMap((m) => m.stations.flatMap((s) => s.items.map((i) => i.name)))
      .slice(0, 40)

    return `Dining court: ${nearest.name}\nCurrent menu items: ${items.join(", ")}`
  },
}
