import { DAILY_VALUES, MG, MCG } from "$lib"

const STORAGE_KEY = "kayle_daily_values"

export type DailyValuesConfig = {
  calories: number
  totalFat: number
  saturatedFat: number
  transFat: number
  cholesterol: number
  sodium: number
  totalCarbohydrate: number
  dietaryFiber: number
  totalSugars: number
  addedSugars: number
  protein: number
  vitaminD: number
  calcium: number
  iron: number
  potassium: number
}

/** Default daily values expressed in the user-facing units shown in the UI (mg/mcg/g/kcal). */
export const DEFAULT_DV_DISPLAY: DailyValuesConfig = {
  calories: 2000,
  totalFat: 78,
  saturatedFat: 20,
  transFat: 0,
  cholesterol: 300,  // mg
  sodium: 2300,      // mg
  totalCarbohydrate: 275,
  dietaryFiber: 28,
  totalSugars: 50,
  addedSugars: 50,
  protein: 50,
  vitaminD: 20,      // mcg
  calcium: 1300,     // mg
  iron: 18,          // mg
  potassium: 4700,   // mg
}

/** Convert display-unit values back to the internal gram-based representation used by DAILY_VALUES. */
function toInternal(display: DailyValuesConfig): typeof DAILY_VALUES {
  return {
    servingSize: "",
    servingsPerContainer: 0,
    calories: display.calories,
    totalFat: display.totalFat,
    saturatedFat: display.saturatedFat,
    transFat: display.transFat,
    cholesterol: display.cholesterol * MG,
    sodium: display.sodium * MG,
    totalCarbohydrate: display.totalCarbohydrate,
    dietaryFiber: display.dietaryFiber,
    totalSugars: display.totalSugars,
    addedSugars: display.addedSugars,
    protein: display.protein,
    vitaminC: DAILY_VALUES.vitaminC, // not user-configurable (not shown in label)
    vitaminD: display.vitaminD * MCG,
    calcium: display.calcium * MG,
    iron: display.iron * MG,
    potassium: display.potassium * MG,
  }
}

function loadDisplay(): DailyValuesConfig {
  if (typeof localStorage === "undefined") return { ...DEFAULT_DV_DISPLAY }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DV_DISPLAY }
    return { ...DEFAULT_DV_DISPLAY, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_DV_DISPLAY }
  }
}

function createDailyValuesStore() {
  let display = $state<DailyValuesConfig>(loadDisplay())

  // Derived internal representation consumed by NutritionLabel
  const internal = $derived(toInternal(display))

  return {
    get display() {
      return display
    },
    get internal() {
      return internal
    },
    set(key: keyof DailyValuesConfig, value: number) {
      display = { ...display, [key]: value }
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(display))
      }
    },
    reset() {
      display = { ...DEFAULT_DV_DISPLAY }
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
  }
}

export const dailyValues = createDailyValuesStore()
