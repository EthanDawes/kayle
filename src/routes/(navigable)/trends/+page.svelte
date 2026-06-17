<script lang="ts">
  import NutrientChart from "./NutrientChart.svelte"
  import { NUMERIC_NUTRIENT_KEYS } from "$lib/services/DiningCourtService"
</script>

<svelte:head>
  <title>Kayle Trends</title>
</svelte:head>

<div
  class="min-h-full bg-linear-to-b from-amber-50 via-orange-50 to-stone-100 px-4 py-5 text-stone-900"
  style="font-family: 'DM Mono', monospace;"
>
  <header class="mb-4 space-y-2">
    <p class="text-xs tracking-[0.2em] text-amber-700 uppercase">Past 7 Days</p>
    <h1 class="text-2xl font-bold text-stone-950">Nutrient Trends</h1>
    <p class="text-sm text-stone-600">All nutrients across your logged meals.</p>
  </header>

  {#each NUMERIC_NUTRIENT_KEYS as nutrient}
    <NutrientChart {nutrient} />
  {/each}
</div>
