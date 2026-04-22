export interface Meal {
  id?: number
  date: string // YYYY-MM-DD
  timestamp: number
  mode: "barcode" | "food"
  name: string
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  servingSize?: string
  description?: string
  brand?: string
  imageDataUrl?: string
  source?: "openfoodfacts" | "openai"
}

export interface NutritionInfo {
  name: string
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  servingSize?: string
  description?: string
  brand?: string
  source: "openfoodfacts" | "openai"
}

export interface
