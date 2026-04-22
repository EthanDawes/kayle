<script lang="ts">
  import type { NutritionInfo } from "$lib/models/meal"

  interface Props {
    result: NutritionInfo
    imageDataUrl?: string
    onConfirm: () => void
    onDiscard: () => void
  }

  let { result, imageDataUrl, onConfirm, onDiscard }: Props = $props()

  const macros = $derived([
    { label: "Protein", value: result.protein, max: 50, color: "#3b82f6" },
    { label: "Carbs", value: result.carbs, max: 275, color: "#f59e0b" },
    { label: "Fat", value: result.fat, max: 78, color: "#ef4444" },
  ])
</script>

<div
  class="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
  style="font-family: 'DM Mono', monospace;"
>
  <div class="w-full max-w-lg rounded-t-3xl bg-zinc-900 p-6 pb-10 shadow-2xl">
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
        {#if result.brand}
          <p class="text-xs text-zinc-500">{result.brand}</p>
        {/if}
        {#if result.servingSize}
          <p class="text-xs text-zinc-500">{result.servingSize}</p>
        {/if}
      </div>
      {#if result.calories != null}
        <div class="shrink-0 text-right">
          <span class="text-3xl font-bold text-white">{Math.round(result.calories)}</span>
          <span class="text-xs text-zinc-500"> kcal</span>
        </div>
      {/if}
    </div>

    {#if result.description}
      <p class="mb-4 text-xs leading-relaxed text-zinc-400">{result.description}</p>
    {/if}

    <!-- Macros -->
    <div class="mb-5 grid grid-cols-3 gap-2">
      {#each macros as m (m.label)}
        <div class="rounded-xl p-3">
          <p class="text-xs tracking-widest text-zinc-500 uppercase">{m.label}</p>
          <p class="mt-0.5 text-lg font-bold">
            {m.value != null ? m.value.toFixed(1) : "–"}g
          </p>
          {#if m.value != null}
            <div class="mt-1.5 h-1 rounded-full">
              <div
                class="h-1 rounded-full transition-all duration-500"
                style="width: {Math.min(100, (m.value / m.max) * 100)}%; background: {m.color};"
              ></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <p class="mb-4 text-center text-xs text-zinc-600">
      via {result.source === "openai" ? "AI Vision" : "Open Food Facts"}
    </p>

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
