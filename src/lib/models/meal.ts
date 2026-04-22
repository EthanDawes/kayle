export interface Meal {
  id?: number
  date: string // YYYY-MM-DD
  timestamp: number
  mode: "barcode" | "food"
  name: string
  nutrients: Nutrients
  description?: string
  brand?: string
  imageDataUrl?: string
  source?: "openfoodfacts" | "openai"
}

export interface NutritionInfo {
  name: string
  nutrients: Nutrients
  description?: string
  source: "openfoodfacts" | "openai"
}

// All units are in grams
export interface Nutrients {
  calories?: number
  totalFat?: number
  saturatedFat?: number
  transFat?: number
  cholesterol?: number
  sodium?: number
  totalCarbohydrate?: number
  dietaryFiber?: number
  totalSugars?: number
  addedSugars?: number
  protein?: number

  // These are the micronutrients
  vitaminD?: number
  vitaminC?: number
  calcium?: number
  iron?: number
  potassium?: number
}
