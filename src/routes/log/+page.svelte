<script lang="ts">
  import { goto } from "$app/navigation"
  import { resolve } from "$app/paths"
  import LoadingOverlay from "$lib/UI/LoadingOverlay.svelte"
  import ResultCard from "$lib/UI/ResultCard.svelte"
  import { processFoodPhoto } from "$lib/workflows/processFoodPhoto"
  import { MealRepository } from "$lib/repositories/MealRepository"
  import { DayOverviewQuery } from "$lib/queries/DayOverviewQuery"
  import type { NutritionInfo } from "$lib/models/meal"
  import MealSelector from "$lib/UI/components/MealSelector.svelte"
  import type { MealDescriptor } from "$lib/services/DiningCourtService"

  let description = $state("")
  let diningCourt = $state<MealDescriptor>({
    date: DayOverviewQuery.today(),
    time: DayOverviewQuery.nowTime(),
    name: "",
  })
  let diningCourtsLoading = $state(true)
  let analyzing = $state(false)
  let result = $state<NutritionInfo | null>(null)
  let error = $state("")

  async function analyze() {
    if (!description.trim()) return
    analyzing = true
    error = ""
    result = null

    try {
      result = await processFoodPhoto(undefined, diningCourt || undefined, description)
    } catch (err) {
      error = err instanceof Error ? err.message : "Analysis failed. Please try again."
    } finally {
      analyzing = false
    }
  }

  async function handleConfirm(scaledResult: NutritionInfo) {
    await MealRepository.add(
      $state.snapshot({
        date: DayOverviewQuery.today(),
        timestamp: Date.now(),
        name: scaledResult.name,
        nutrients: scaledResult.nutrients,
        imageDataUrl: undefined,
        source: scaledResult.source,
        components: scaledResult.components,
      }),
    )
    goto(resolve("/"))
  }

  function reset() {
    result = null
    error = ""
  }
</script>

<svelte:head>
  <title>Kayle Log</title>
</svelte:head>

<div class="relative flex flex-col gap-5 p-5">
  <MealSelector bind:diningCourt />

  <!-- Text description -->
  <div class="flex flex-col gap-2">
    <label class="text-xs tracking-[0.2em] text-zinc-400 uppercase" for="description">
      What did you eat?
    </label>
    <textarea
      id="description"
      bind:value={description}
      placeholder="e.g. Scrambled eggs, wheat toast, orange juice..."
      rows="4"
      class="w-full resize-none rounded-xl border border-zinc-700 px-4 py-3 text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
    ></textarea>
  </div>

  {#if error}
    <div class="rounded-xl border border-red-900 bg-red-950/20 p-4">
      <p class="text-xs leading-relaxed text-red-400">
        {error}
      </p>
    </div>
  {/if}

  <button
    onclick={analyze}
    disabled={!description.trim() || analyzing}
    class="w-full rounded-full bg-white py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    type="button"
  >
    Analyze Meal
  </button>
</div>

{#if analyzing}
  <LoadingOverlay message="Analyzing food..." />
{/if}

{#if result}
  <ResultCard {result} onConfirm={handleConfirm} onDiscard={reset} />
{/if}
