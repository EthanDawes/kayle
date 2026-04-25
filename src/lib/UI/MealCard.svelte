<script lang="ts">
  import NutritionLabel from "$lib/UI/NutritionLabel.svelte"
  import type { Meal } from "$lib/models/meal"

  interface Props {
    meal: Meal
    onDelete?: (id: number) => void
  }

  let { meal, onDelete }: Props = $props()

  const icon = $derived(meal.source === "openfoodfacts" ? "📦" : "🍽")
</script>

<div class="space-y-4 rounded-2xl p-4" style="font-family: 'DM Mono', monospace;">
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0 flex-1 space-y-1">
      <p class="text-sm font-semibold">{meal.name}</p>
      {#if meal.description}
        <p class="text-xs leading-5 text-zinc-400">{meal.description}</p>
      {/if}
    </div>

    {#if onDelete && meal.id != null}
      <button
        onclick={() => onDelete?.(meal.id!)}
        class="shrink-0 rounded-full p-2 text-zinc-700 transition-colors hover:text-zinc-400"
        aria-label="Remove meal"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    {/if}
  </div>

  <NutritionLabel {...meal.nutrients} />

  {#if meal.imageDataUrl}
    <img src={meal.imageDataUrl} alt={meal.name} class="h-48 w-full rounded-xl object-cover" />
  {:else}
    <div
      class="flex h-32 w-full items-center justify-center rounded-xl bg-zinc-900 text-4xl"
      aria-label={`${meal.name} placeholder image`}
    >
      {icon}
    </div>
  {/if}
</div>
