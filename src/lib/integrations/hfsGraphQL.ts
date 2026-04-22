const HFS_API = "https://api.hfs.purdue.edu/menus/v3/GraphQL"

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(HFS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`HFS API ${res.status}`)
  const data = await res.json()
  if (data.errors?.length) throw new Error(data.errors[0]?.message ?? "GraphQL error")
  return data.data as T
}

export interface DiningLocation {
  name: string
  latitude: number
  longitude: number
}

export interface MenuItem {
  name: string
}

export interface DiningStation {
  name: string
  items: MenuItem[]
}

export interface DiningMenu {
  meal: string
  stations: DiningStation[]
}

export async function getLocations(): Promise<DiningLocation[]> {
  const data = await gql<{ locations: DiningLocation[] }>(`
    query {
      locations {
        name
        latitude
        longitude
      }
    }
  `)
  return data.locations ?? []
}

export async function getMenus(location: string, date: string): Promise<DiningMenu[]> {
  const data = await gql<{ menus: DiningMenu[] }>(
    `
    query GetMenus($location: String!, $date: String!) {
      menus(location: $location, date: $date) {
        meal
        stations {
          name
          items {
            name
          }
        }
      }
    }
  `,
    { location, date },
  )
  return data.menus ?? []
}
