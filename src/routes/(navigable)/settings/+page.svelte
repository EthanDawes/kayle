<script lang="ts">
  import { settings } from "$lib/stores/settings.svelte"
  import { dailyValues, DEFAULT_DV_DISPLAY } from "$lib/stores/dailyValues.svelte"
  import type { DailyValuesConfig } from "$lib/stores/dailyValues.svelte"

  let openaiKey = $state(settings.openaiKey)
  let offKey = $state(settings.openfoodfactsKey)
  let showOpenai = $state(false)
  let showOff = $state(false)
  let saved = $state(false)
  let dvOpen = $state(false)

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

  function handleDvInput(key: keyof DailyValuesConfig, e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value)
    dailyValues.set(key, isNaN(val) ? 0 : Math.max(0, val))
  }

  type DvField = {
    key: keyof DailyValuesConfig
    label: string
    unit: string
    step: number
  }

  const dvFields: DvField[] = [
    { key: "calories", label: "Calories", unit: "kcal", step: 50 },
    { key: "totalFat", label: "Total Fat", unit: "g", step: 1 },
    { key: "saturatedFat", label: "Saturated Fat", unit: "g", step: 1 },
    { key: "transFat", label: "Trans Fat", unit: "g", step: 0.1 },
    { key: "cholesterol", label: "Cholesterol", unit: "mg", step: 10 },
    { key: "sodium", label: "Sodium", unit: "mg", step: 50 },
    { key: "totalCarbohydrate", label: "Total Carbohydrate", unit: "g", step: 5 },
    { key: "dietaryFiber", label: "Dietary Fiber", unit: "g", step: 1 },
    { key: "totalSugars", label: "Total Sugars", unit: "g", step: 5 },
    { key: "addedSugars", label: "Added Sugars", unit: "g", step: 5 },
    { key: "protein", label: "Protein", unit: "g", step: 5 },
    { key: "vitaminD", label: "Vitamin D", unit: "mcg", step: 1 },
    { key: "calcium", label: "Calcium", unit: "mg", step: 50 },
    { key: "iron", label: "Iron", unit: "mg", step: 1 },
    { key: "potassium", label: "Potassium", unit: "mg", step: 100 },
  ]
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

  <!-- ── Daily Values ──────────────────────────────────────── -->
  <div class="rounded-2xl border border-zinc-900 overflow-hidden">
    <!-- Collapsible header -->
    <button
      id="dv-toggle"
      type="button"
      onclick={() => (dvOpen = !dvOpen)}
      class="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-900/60"
      aria-expanded={dvOpen}
      aria-controls="dv-panel"
    >
      <div>
        <p class="text-xs tracking-[0.2em] text-zinc-500 uppercase">Nutrition Label</p>
        <p class="text-sm font-semibold text-white mt-0.5">Daily Values</p>
      </div>
      <span
        class="text-zinc-500 transition-transform duration-200 text-lg select-none"
        style="transform: rotate({dvOpen ? 180 : 0}deg)"
        aria-hidden="true"
      >
        ▾
      </span>
    </button>

    <!-- Collapsible body -->
    {#if dvOpen}
      <div id="dv-panel" class="border-t border-zinc-900 px-5 pb-5 pt-4 flex flex-col gap-3">
        <p class="text-xs text-zinc-600 leading-relaxed">
          Set a nutrient's daily value to <strong class="text-zinc-400">0</strong> to hide it from the
          nutrition label. Changes are saved automatically.
        </p>

        <div class="grid grid-cols-1 gap-2">
          {#each dvFields as field}
            {@const current = dailyValues.display[field.key]}
            {@const isDefault = current === DEFAULT_DV_DISPLAY[field.key]}
            {@const isHidden = current === 0}
            <div class="flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-zinc-800 transition-colors"
              class:ring-zinc-700={!isDefault}
              class:bg-zinc-900={isHidden}
            >
              <label
                class="flex-1 text-xs text-zinc-400 truncate"
                for="dv-{field.key}"
              >
                {field.label}
                {#if isHidden}
                  <span class="ml-1.5 text-zinc-600 text-[10px]">(hidden)</span>
                {/if}
              </label>
              <div class="flex items-center gap-1.5 shrink-0">
                <input
                  id="dv-{field.key}"
                  type="number"
                  min="0"
                  step={field.step}
                  value={current}
                  oninput={(e) => handleDvInput(field.key, e)}
                  class="w-20 rounded-lg bg-zinc-800 px-2 py-1.5 text-right text-sm text-white outline-none ring-1 ring-zinc-700 focus:ring-white/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span class="text-xs text-zinc-600 w-8">{field.unit}</span>
              </div>
            </div>
          {/each}
        </div>

        <button
          type="button"
          onclick={() => dailyValues.reset()}
          class="mt-1 self-start rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
        >
          Reset to defaults
        </button>
      </div>
    {/if}
  </div>

  <!-- Info box -->
  <div class="rounded-xl border border-zinc-800 p-4">
    <p class="text-xs leading-relaxed text-zinc-600">
      Keys are stored only in your browser's localStorage. They are sent directly to OpenAI and Open
      Food Facts and never routed through any other server.
    </p>
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
