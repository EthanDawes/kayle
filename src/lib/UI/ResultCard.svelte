<script lang="ts">
  import type { NutritionInfo } from "$lib/models/meal"
  import NutritionLabel from "$lib/UI/NutritionLabel.svelte"

  interface Props {
    result: NutritionInfo
    imageDataUrl?: string
    onConfirm: () => void
    onDiscard: () => void
  }

  let { result, imageDataUrl, onConfirm, onDiscard }: Props = $props()
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

      <NutritionLabel {...result.nutrients} />

      <p class="mb-4 text-center text-xs text-zinc-600">
        via {result.source === "openai" ? "AI Vision" : "Open Food Facts"}
      </p>
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
        onclick={onConfirm}
        class="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
      >
        Log Meal
      </button>
    </div>
  </div>
</div>
