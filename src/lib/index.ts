import type { Nutrients } from "./models/meal"

export const G = 1
export const MG = G / 1000
export const MCG = MG / 1000

// Daily Values reference (in grams unless noted)
export const DAILY_VALUES = {
  servingSize: "",
  servingsPerContainer: 0,
  calories: 2000,
  totalFat: 78,
  saturatedFat: 20,
  transFat: 0, // No official DV; 0 means "no bar"
  cholesterol: 0.3, // 300mg → stored as grams equivalent
  sodium: 2.3, // 2300mg → stored as grams equivalent
  totalCarbohydrate: 275,
  dietaryFiber: 28,
  totalSugars: 50,
  addedSugars: 50,
  protein: 50,
  vitaminC: 90 * MG,
  vitaminD: 20 * MCG,
  calcium: 1.3, // 1300mg → grams
  iron: 0.018, // 18mg → grams
  potassium: 4.7, // 4700mg → grams
} satisfies Required<Nutrients>
