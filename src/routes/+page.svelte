<script lang="ts">
  import { onMount } from "svelte"
  import { DayOverviewQuery, type DayOverview } from "$lib/queries/DayOverviewQuery"
  import { MealRepository } from "$lib/repositories/MealRepository"
  import MealCard from "$lib/UI/MealCard.svelte"
  import Spinner from "$lib/UI/components/Spinner.svelte"
  import NutritionLabel from "$lib/UI/NutritionLabel.svelte"
  import { LLMService } from "$lib/services/LLMService"
  import { settings } from "$lib/stores/settings.svelte"
  import Markdown from "svelte-markdown"

  let overview = $state<DayOverview | null>(null)
  let loading = $state(true)
  let suggestedMeal = $state("")

  async function load() {
    loading = true
    overview = await DayOverviewQuery.forDate(DayOverviewQuery.today())
    loading = false
  }

  async function deleteMeal(id: number) {
    await MealRepository.delete(id)
    await load()
  }

  onMount(load)

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
</script>

<svelte:head>
  <title>Kayle Home</title>
</svelte:head>

<div class="flex h-full w-full flex-col" style="font-family: 'DM Mono', monospace;">
  <!-- Header -->
  <div class="pt-2">
    <p class="text-xs tracking-[0.2em] text-zinc-500 uppercase">{todayLabel}</p>
    <h1 class="text-2xl font-bold text-white">Today</h1>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-16">
      <Spinner />
    </div>
  {:else if overview}
    <div class="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth">
      <div class="h-full w-full shrink-0 snap-start">
        <!-- Day summary page -->

        <button
          class="mb-2 cursor-pointer border"
          onclick={() =>
            LLMService.suggestMeals(settings.openaiKey).then((meal) => (suggestedMeal = meal))}
        >
          Suggest meals
        </button>
        <div class="md">
          <Markdown source={suggestedMeal} />
        </div>

        {#if overview.meals.length > 0}
          <NutritionLabel {...overview.nutrients} />
        {:else}
          <div class="flex flex-col items-center gap-2 py-16 text-center">
            <span class="text-5xl">🍽</span>
            <p class="text-sm text-zinc-500">Nothing logged yet.</p>
            <p class="text-xs text-zinc-600">Tap Scan to get started.</p>
          </div>
        {/if}
      </div>
      {#each overview.meals.toReversed() as meal (meal.id)}
        <div class="h-full w-full shrink-0 snap-start">
          <MealCard {meal} onDelete={deleteMeal} />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(.md ul) {
    list-style-type: circle;
    list-style-position: inside;
    font-size: small;
  }
  :global(.md li) {
    margin-bottom: 0.5rem;
  }
</style>
