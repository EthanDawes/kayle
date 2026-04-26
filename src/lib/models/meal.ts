export interface Meal {
  id?: number
  date: string // YYYY-MM-DD
  timestamp: number
  name: string
  nutrients: Nutrients
  description?: string
  imageDataUrl?: string
  source?: "openfoodfacts" | "openai"
}

export interface NutritionInfo {
  name: string
  nutrients: Nutrients
  description?: string
  source: "openfoodfacts" | "openai"
  diningCourt?: string
}

// All units are in grams
export interface Nutrients {
  servingSize?: string
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
