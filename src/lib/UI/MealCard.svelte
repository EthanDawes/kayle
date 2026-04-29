<script lang="ts">
  import NutritionLabel from "$lib/UI/NutritionLabel.svelte"
  import type { Meal, MealComponent, Nutrients } from "$lib/models/meal"
  import { DiningCourtService } from "$lib/services/DiningCourtService"

  interface Props {
    meal: Meal
    onDelete?: (id: number) => void
  }

  let { meal, onDelete }: Props = $props()

  const time = $derived(
    new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  )
  const icon = $derived(meal.source === "openfoodfacts" ? "📦" : "🍽")

  let activeComponent = $state<MealComponent | null>(null)

  function scaledNutrients(comp: MealComponent): Nutrients {
    return DiningCourtService.multiplyNutrients({ ...comp.baseNutrients }, comp.servings)
  }
</script>

<div style="font-family: 'DM Mono', monospace;">
  <div class="flex items-center gap-3 rounded-2xl p-4">
    {#if meal.imageDataUrl}
      <img
        src={meal.imageDataUrl}
        alt={meal.name}
        class="h-14 w-14 shrink-0 rounded-xl object-cover"
      />
    {:else}
      <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl">
        {icon}
      </div>
    {/if}

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold">{meal.name}</p>
      <p class="text-xs text-zinc-500">
        {time}{meal.nutrients.servingSize ? ` · ${meal.nutrients.servingSize}` : ""}
      </p>
      {#if meal.nutrients.calories != null}
        <p class="mt-0.5 text-xs text-zinc-400">
          {Math.round(meal.nutrients.calories)} kcal
        </p>
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

  {#if meal.components && meal.components.length > 0}
    <div class="space-y-0.5 px-4 pb-3">
      {#each meal.components as comp (comp.name)}
        <button
          onclick={() => (activeComponent = activeComponent?.name === comp.name ? null : comp)}
          class="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-zinc-800"
        >
          <span class="min-w-0 flex-1 truncate text-xs text-zinc-400">{comp.name}</span>
          <span class="shrink-0 text-xs text-zinc-600">{comp.servings}× {comp.servingSize}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

{#if activeComponent}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
    onclick={() => (activeComponent = null)}
  >
    <div onclick={(e) => e.stopPropagation()} class="max-h-[85vh] overflow-y-auto">
      <p class="mb-3 text-center text-sm font-semibold text-white">
        {activeComponent.name}
        <span class="text-zinc-400">({activeComponent.servings}× {activeComponent.servingSize})</span>
      </p>
      <NutritionLabel {...scaledNutrients(activeComponent)} />
    </div>
  </div>
{/if}
