const KEYS = {
  openai: "kayle_openai_key",
  openfoodfacts: "kayle_off_key",
} as const

function load(key: string): string {
  if (typeof localStorage === "undefined") return ""
  return localStorage.getItem(key) ?? ""
}

function createSettings() {
  let openaiKey = $state(load(KEYS.openai))
  let openfoodfactsKey = $state(load(KEYS.openfoodfacts))

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
  }
}

export const settings = createSettings()
