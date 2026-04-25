import { GraphQLClient } from "graphql-request"
import { getSdk } from "./generated"

const client = new GraphQLClient("https://kayle.ethand-python.workers.dev")

export const sdk = getSdk(client)

export interface DiningCourtLocation {
  name: string
  latitude: number | null
  longitude: number | null
  category: string
}

function getCurrentMeals<T extends { startTime?: any; endTime?: any }>(
  meals: T[] | null | undefined,
  now: Date,
) {
  return (
    meals?.filter((meal) => {
      if (!meal.startTime || !meal.endTime) return false
      const start = new Date(meal.startTime)
      const end = new Date(meal.endTime)
      return now >= start && now < end
    }) ?? []
  )
}

export async function getLocations() {
  const now = new Date()
  const data = await sdk.diningCourts({ date: now.toISOString().split("T")[0] })

  return (data.diningCourts ?? [])
    .map((court) => {
      const currentMeals = getCurrentMeals(court?.dailyMenu?.meals, now)

      return {
        ...court,
        dailyMenu: currentMeals,
      }
    })
    .filter((court) => court.dailyMenu.length > 0)
}

export async function getDiningCourts(): Promise<DiningCourtLocation[]> {
  return (await getLocations()) as DiningCourtLocation[]
}

export async function getMenu(location: string) {
  const now = new Date()
  const data = await sdk.getMenu({ date: now.toISOString().split("T")[0], location })
  const currentMeals = getCurrentMeals(data.diningCourtByName?.dailyMenu?.meals, now)
  const items = currentMeals.flatMap((meal) =>
    meal.stations.flatMap((station) => station.items.map((item) => item.item)),
  )
  return items
}

export async function getAllFoods(): Promise<Record<string, string[]>> {
  const now = new Date()
  const data = await sdk.allFoods({ date: now.toISOString().split("T")[0] })
  return Object.fromEntries(
    data.diningCourts!.map((court) => [
      court?.name,
      getCurrentMeals(court!.dailyMenu!.meals, now).flatMap((meal) =>
        meal.stations.flatMap((station) => station.items.map((item) => item.item.name)),
      ),
    ]),
  )
}

globalThis.getAllFoods = getAllFoods
