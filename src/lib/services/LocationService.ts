export interface Coordinates {
  latitude: number
  longitude: number
}

export const LocationService = {
  async get(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(new Error(err.message)),
        { timeout: 5000, maximumAge: 60_000 },
      )
    })
  },
}
