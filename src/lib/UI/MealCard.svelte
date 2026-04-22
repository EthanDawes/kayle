<script lang="ts">
  import type { Meal } from "$lib/models/meal"

  interface Props {
    meal: Meal
    onDelete?: (id: number) => void
  }

  let { meal, onDelete }: Props = $props()

  const time = $derived(
    new Date(meal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  )
  const icon = $derived(meal.mode === "barcode" ? "📦" : "🍽")
</script>

<div
  class="flex items-center gap-3 rounded-2xl bg-zinc-900 p-4"
  style="font-family: 'DM Mono', monospace;"
>
  {#if meal.imageDataUrl}
    <img
      src={meal.imageDataUrl}
      alt={meal.name}
      class="h-14 w-14 shrink-0 rounded-xl object-cover"
    />
  {:else}
    <div
      class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl"
    >
      {icon}
    </div>
  {/if}

  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-semibold text-white">{meal.name}</p>
    <p class="text-xs text-zinc-500">
      {time}{meal.servingSize ? ` · ${meal.servingSize}` : ""}
    </p>
    {#if meal.calories != null}
      <p class="mt-0.5 text-xs text-zinc-400">
        {Math.round(meal.calories)} kcal
        {#if meal.protein != null}· P {meal.protein.toFixed(0)}g{/if}
        {#if meal.carbs != null}· C {meal.carbs.toFixed(0)}g{/if}
        {#if meal.fat != null}· F {meal.fat.toFixed(0)}g{/if}
      </p>
    {/if}
  </div>

  {#if onDelete && meal.id != null}
    <button
      onclick={() => onDelete?.(meal.id!)}
      class="shrink-0 rounded-full p-2 text-zinc-700 transition-colors hover:text-zinc-400"
      aria-label="Remove meal"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</div>
