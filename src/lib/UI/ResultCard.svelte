<script lang="ts">
  import type { NutritionInfo } from "$lib/models/meal"
  import { DiningCourtService } from "$lib/services/DiningCourtService"
  import NutritionLabel from "$lib/UI/NutritionLabel.svelte"

  interface Props {
    result: NutritionInfo
    imageDataUrl?: string
    onConfirm: (scaledResult: NutritionInfo) => void
    onDiscard: () => void
  }

  let { result, imageDataUrl, onConfirm, onDiscard }: Props = $props()

  let servings = $state(1)

  const isBarcode = $derived(result.source === "openfoodfacts")

  const scaledNutrients = $derived(() => {
    // Optimization: skip scaling when servings is 1 (multiplying by 1 is a no-op)
    if (servings === 1) return result.nutrients
    return DiningCourtService.multiplyNutrients({ ...result.nutrients }, servings)
  })

  function confirm() {
    onConfirm({ ...result, nutrients: scaledNutrients() })
  }
</script>

<div
  class="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
  style="font-family: 'DM Mono', monospace;"
>
  <div class="w-full max-w-lg rounded-t-3xl bg-zinc-900 p-6 pb-10 shadow-2xl">
    <div class="max-h-[80vh] overflow-y-auto">
      {#if imageDataUrl}
        <img
          src={imageDataUrl}
          alt="Captured food"
          class="mb-4 h-36 w-full rounded-2xl object-cover"
        />
      {/if}

      <!-- Name + calories -->
      <div class="mb-3 flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-bold text-white">{result.name}</h2>
        </div>
      </div>

      {#if result.description}
        <p class="mb-4 text-xs leading-relaxed text-zinc-400">{result.description}</p>
      {/if}

      {#if isBarcode}
        <div class="mb-4 flex items-center gap-3">
          <label class="text-sm text-zinc-400" for="servings-input">Servings eaten</label>
          <input
            id="servings-input"
            type="number"
            min="0.1"
            step="0.25"
            bind:value={servings}
            class="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white outline-none focus:border-zinc-500"
          />
        </div>
      {/if}

      <NutritionLabel {...scaledNutrients()} />

      <p class="mb-4 text-center text-xs text-zinc-600">
        via {result.source === "openai" ? "AI Vision" : "Open Food Facts"}
      </p>

      {#if result.explaination}
        <pre class="text-white">{result.explaination}</pre>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        onclick={onDiscard}
        class="flex-1 rounded-full border border-zinc-700 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
      >
        Discard
      </button>
      <button
        onclick={confirm}
        class="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
      >
        Log Meal
      </button>
    </div>
  </div>
</div>
