export interface MealComponent {
  name: string
  servings: number
  servingSize: string
  baseNutrients: Nutrients
}

export interface Meal {
  id?: number
  date: string // YYYY-MM-DD
  timestamp: number
  name: string
  nutrients: Nutrients
  imageDataUrl?: string
  source?: "openfoodfacts" | "openai"
  components?: MealComponent[]
}

export interface ExportedMeal extends MealComponent {
  // Id?
  date: Date
}

export interface NutritionInfo {
  name: string
  nutrients: Nutrients
  imageDataUrl?: string
  source: "openfoodfacts" | "openai"
  components?: MealComponent[]
}

// All units are in grams
export interface Nutrients {
  servingSize?: string
  servingsPerContainer?: number
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
