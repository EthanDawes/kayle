<script lang="ts">
  import { DAILY_VALUES } from "$lib"
  import { settings, type DailyValueKey } from "$lib/stores/settings.svelte"
  import { NUMERIC_NUTRIENT_KEYS, NUMERIC_NUTRIENT_LABELS } from "$lib/services/DiningCourtService"
  import {
    getNutrientUnit,
    scaleNutrientValue,
    unscaleNutrientValue,
  } from "$lib/utils/nutrientUnits"

  let openaiKey = $state(settings.openaiKey)
  let offKey = $state(settings.openfoodfactsKey)
  let showOpenai = $state(false)
  let showOff = $state(false)
  let showDailyValues = $state(false)
  let saved = $state(false)

  function displayValue(key: DailyValueKey): number {
    const stored = settings.dailyValues[key]
    if (stored === -1) return scaleNutrientValue(key, DAILY_VALUES[key])
    return scaleNutrientValue(key, stored)
  }

  function isHidden(key: DailyValueKey): boolean {
    return settings.dailyValues[key] === -1
  }

  function setDisplayValue(key: DailyValueKey, display: number) {
    settings.setDailyValue(key, unscaleNutrientValue(key, display))
  }

  function setHidden(key: DailyValueKey, hidden: boolean) {
    if (hidden) {
      settings.setDailyValue(key, -1)
    } else {
      settings.setDailyValue(key, DAILY_VALUES[key])
    }
  }

  function save() {
    settings.setOpenaiKey(openaiKey)
    settings.setOpenfoodfactsKey(offKey)
    saved = true
    setTimeout(() => (saved = false), 2000)
  }

  function clear() {
    openaiKey = ""
    offKey = ""
    settings.setOpenaiKey("")
    settings.setOpenfoodfactsKey("")
  }

  function resetDailyValues() {
    settings.resetDailyValues()
  }
</script>

<svelte:head>
  <title>Kayle Settings</title>
</svelte:head>

<div class="flex flex-col gap-6 p-5" style="font-family: 'DM Mono', monospace;">
  <div class="pt-2">
    <p class="text-xs tracking-[0.2em] text-zinc-500 uppercase">Configuration</p>
    <h1 class="text-2xl font-bold text-white">Settings</h1>
  </div>

  <div class="flex flex-col gap-5 rounded-2xl border border-zinc-900 p-5">
    <!-- OpenAI key -->
    <div class="flex flex-col gap-2">
      <label class="text-xs tracking-[0.2em] text-zinc-400 uppercase" for="openai-key">
        OpenAI API Key
      </label>
      <p class="text-xs text-zinc-600">Required for food photo analysis (GPT-4o Vision).</p>
      <div class="relative">
        <input
          id="openai-key"
          type={showOpenai ? "text" : "password"}
          bind:value={openaiKey}
          placeholder="sk-..."
          class="w-full rounded-xl px-4 py-3 pr-12 text-sm placeholder-zinc-600 ring-1 ring-zinc-700 outline-none focus:ring-white/30"
        />
        <button
          onclick={() => (showOpenai = !showOpenai)}
          class="absolute top-1/2 right-3 -translate-y-1/2 text-lg text-zinc-500 transition-colors hover:text-zinc-300"
          aria-label="Toggle OpenAI key visibility"
          type="button"
        >
          {showOpenai ? "🙈" : "👁️"}
        </button>
      </div>
    </div>

    <!-- OpenFoodFacts key -->
    <div class="flex flex-col gap-2">
      <label class="text-xs tracking-[0.2em] text-zinc-400 uppercase" for="off-key">
        Open Food Facts API Key
      </label>
      <p class="text-xs text-zinc-600">
        Optional — enables higher rate limits for barcode scanning.
      </p>
      <div class="relative">
        <input
          id="off-key"
          type={showOff ? "text" : "password"}
          bind:value={offKey}
          placeholder="optional"
          class="w-full rounded-xl px-4 py-3 pr-12 text-sm placeholder-zinc-600 ring-1 ring-zinc-700 outline-none focus:ring-white/30"
        />
        <button
          onclick={() => (showOff = !showOff)}
          class="absolute top-1/2 right-3 -translate-y-1/2 text-lg text-zinc-500 transition-colors hover:text-zinc-300"
          aria-label="Toggle OpenFoodFacts key visibility"
          type="button"
        >
          {showOff ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  </div>

  <!-- Info box -->
  <div class="rounded-xl border border-zinc-800 p-4">
    <p class="text-xs leading-relaxed text-zinc-600">
      Keys are stored only in your browser's localStorage. They are sent directly to OpenAI and Open
      Food Facts and never routed through any other server.
    </p>
  </div>

  <!-- Daily values -->
  <div class="overflow-hidden rounded-2xl border border-zinc-900">
    <button
      type="button"
      onclick={() => (showDailyValues = !showDailyValues)}
      class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-900/20"
      aria-expanded={showDailyValues}
    >
      <div>
        <p class="text-xs tracking-[0.2em] text-zinc-400 uppercase">Nutrition Label</p>
        <p class="text-sm font-semibold text-zinc-400">Daily Values</p>
      </div>
      <span class="text-zinc-500 transition-transform" class:rotate-180={showDailyValues}>▼</span>
    </button>

    {#if showDailyValues}
      <div class="flex flex-col gap-4 border-t border-zinc-900 px-5 pt-4 pb-5">
        <p class="text-xs leading-relaxed text-zinc-600">
          Customize daily value targets shown on nutrition labels. Uncheck "Show" to hide a nutrient
          entirely. Values save automatically.
        </p>
        <p class="text-xs">
          <a href="https://www.nal.usda.gov/human-nutrition-and-food-safety/dri-calculator" target="_blank" class="underline text-blue-500 hover:text-blue-300">
            USDA Daily Value Calculator
          </a>
        </p>

        <div class="flex flex-col gap-3">
          {#each NUMERIC_NUTRIENT_KEYS as key}
            {@const unit = getNutrientUnit(key)}
            {@const hidden = isHidden(key)}
            <div class="flex items-center gap-3">
              <label class="min-w-0 flex-1 text-sm text-zinc-600" for="dv-{key}">
                {NUMERIC_NUTRIENT_LABELS[key]}
              </label>
              <div class="flex items-center gap-2">
                <input
                  id="dv-{key}"
                  type="number"
                  min="0"
                  step="any"
                  value={displayValue(key)}
                  disabled={hidden}
                  oninput={(e) =>
                    setDisplayValue(key, Number((e.currentTarget as HTMLInputElement).value))}
                  class="w-24 rounded-lg px-3 py-2 text-right text-sm ring-1 ring-zinc-700 outline-none focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                />
                <span class="w-8 text-xs text-zinc-500">{unit}</span>
                <label class="flex items-center gap-1.5 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    checked={!hidden}
                    onchange={(e) => setHidden(key, !(e.currentTarget as HTMLInputElement).checked)}
                    class="rounded border-zinc-600"
                  />
                  Show
                </label>
              </div>
            </div>
          {/each}
        </div>

        <button
          type="button"
          onclick={resetDailyValues}
          class="self-start rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
        >
          Reset to defaults
        </button>
      </div>
    {/if}
  </div>

  <!-- Actions -->
  <div class="flex gap-3">
    <button
      onclick={clear}
      class="flex-1 rounded-full border border-zinc-700 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
      type="button"
    >
      Clear All
    </button>
    <button
      onclick={save}
      class="flex-1 rounded-full py-3 text-sm font-semibold transition-all"
      class:bg-green-500={saved}
      class:text-white={saved}
      class:bg-white={!saved}
      class:text-zinc-900={!saved}
      class:hover:opacity-90={!saved}
      type="button"
    >
      {saved ? "✓ Saved" : "Save"}
    </button>
  </div>
</div>
