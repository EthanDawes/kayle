<script lang="ts">
  import type { NutritionInfo, Nutrients } from "$lib/models/meal"
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
  let servingsOverride = $state<Record<string, number>>({})

  const isBarcode = $derived(result.source === "openfoodfacts")

  const editableComponents = $derived.by(() =>
    (result.components ?? []).map((c) => ({
      ...c,
      servings: servingsOverride[c.name] ?? c.servings,
    })),
  )

  const scaledNutrients = $derived.by(() => {
    if (editableComponents.length > 0) {
      return editableComponents.reduce((acc, comp) => {
        return DiningCourtService.addNutrients(
          acc,
          DiningCourtService.multiplyNutrients({ ...comp.baseNutrients }, comp.servings),
        )
      }, {} as Nutrients)
    }
    if (servings === 1) return result.nutrients
    return DiningCourtService.multiplyNutrients({ ...result.nutrients }, servings)
  })

  function confirm() {
    onConfirm({
      ...result,
      nutrients: scaledNutrients,
      components: editableComponents.length > 0 ? editableComponents.map((c) => ({ ...c })) : undefined,
    })
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

      <div class="mb-3 flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-bold text-white">{result.name}</h2>
        </div>
      </div>

      {#if editableComponents.length > 0}
        <div class="mb-4 space-y-2">
          {#each editableComponents as comp (comp.name)}
            <div class="flex items-center gap-2">
              <span class="min-w-0 flex-1 truncate text-sm text-zinc-300">{comp.name}</span>
              <span class="shrink-0 text-xs text-zinc-500">{comp.servingSize}</span>
              <input
                type="number"
                min="0"
                step="0.25"
                value={comp.servings}
                oninput={(e) => {
                  servingsOverride[comp.name] = Number(e.currentTarget.value)
                }}
                class="w-20 shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-zinc-500"
              />
            </div>
          {/each}
        </div>
      {:else if isBarcode}
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

      <NutritionLabel {...scaledNutrients} />

      <p class="mb-4 text-center text-xs text-zinc-600">
        via {result.source === "openai" ? "AI Vision" : "Open Food Facts"}
      </p>
    </div>

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
