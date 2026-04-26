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

// Needed over toISOString because if late in the day, will think it's the next day
export function localISODate(today: Date) {
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-")
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
  const data = await sdk.diningCourts({ date: localISODate(now) })

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

export async function getMenu(location: string) {
  const now = new Date()

  const data = await sdk.getMenu({
    date: localISODate(now),
    location,
  })

  const currentMeals = getCurrentMeals(data.diningCourtByName?.dailyMenu?.meals, now)

  const items = currentMeals.flatMap((meal) =>
    meal.stations.flatMap((station) =>
      station.items.flatMap((entry) => [
        entry.item,
        ...(entry.components ?? []).map((component) => component.item),
      ]),
    ),
  )

  // Don't include items with no nutrition facts
  return items.filter(
    (
      item,
    ): item is typeof item & {
      nutritionFacts: NonNullable<typeof item.nutritionFacts>
    } => item.nutritionFacts != null,
  )
}

export async function getAllFoods(): Promise<Record<string, string[]>> {
  const now = new Date()
  const data = await sdk.allFoods({ date: localISODate(now) })
  return Object.fromEntries(
    data.diningCourts!.map((court) => [
      court?.name,
      getCurrentMeals(court!.dailyMenu!.meals, now).flatMap((meal) =>
        meal.stations.flatMap((station) => station.items.map((item) => item.item.name)),
      ),
    ]),
  )
}

globalThis.getLocations = getLocations
