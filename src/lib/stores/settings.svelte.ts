import { DAILY_VALUES } from "$lib"
import type { NumericNutrientKey } from "$lib/services/DiningCourtService"

const { servingSize: _, servingsPerContainer: __, ...dailyValueDefaults } = DAILY_VALUES

const KEYS = {
  openai: "kayle_openai_key",
  openfoodfacts: "kayle_off_key",
  dailyValues: "kayle_daily_values",
} as const

function load(key: string): string {
  if (typeof localStorage === "undefined") return ""
  return localStorage.getItem(key) ?? ""
}

function loadDailyValues(): Record<NumericNutrientKey, number> {
  const raw = load(KEYS.dailyValues)
  if (!raw) return { ...dailyValueDefaults }
  try {
    const parsed = JSON.parse(raw) as Partial<Record<NumericNutrientKey, number>>
    return { ...dailyValueDefaults, ...parsed }
  } catch {
    return { ...dailyValueDefaults }
  }
}

function persistDailyValues(values: Record<NumericNutrientKey, number>) {
  localStorage.setItem(KEYS.dailyValues, JSON.stringify(values))
}

function createSettings() {
  let openaiKey = $state(load(KEYS.openai))
  let openfoodfactsKey = $state(load(KEYS.openfoodfacts))
  let dailyValues = $state(loadDailyValues())

  return {
    get openaiKey() {
      return openaiKey
    },
    setOpenaiKey(v: string) {
      openaiKey = v
      localStorage.setItem(KEYS.openai, v)
    },
    get openfoodfactsKey() {
      return openfoodfactsKey
    },
    setOpenfoodfactsKey(v: string) {
      openfoodfactsKey = v
      localStorage.setItem(KEYS.openfoodfacts, v)
    },
    get hasOpenai() {
      return openaiKey.trim().length > 0
    },
    get dailyValues() {
      return dailyValues
    },
    getDailyValue(key: NumericNutrientKey): number {
      return dailyValues[key]
    },
    isNutrientVisible(key: NumericNutrientKey): boolean {
      return dailyValues[key] !== -1
    },
    setDailyValue(key: NumericNutrientKey, value: number) {
      dailyValues = { ...dailyValues, [key]: value }
      persistDailyValues(dailyValues)
    },
    resetDailyValues() {
      dailyValues = { ...dailyValueDefaults }
      persistDailyValues(dailyValues)
    },
  }
}

export const settings = createSettings()
