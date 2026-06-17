<script lang="ts">
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import { resolve } from "$app/paths"
  import LoadingOverlay from "$lib/UI/LoadingOverlay.svelte"
  import ResultCard from "$lib/UI/ResultCard.svelte"
  import { getLocations, type DiningCourtLocation } from "$lib/integrations/hfsGraphQL"
  import { processFoodPhoto } from "$lib/workflows/processFoodPhoto"
  import { MealRepository } from "$lib/repositories/MealRepository"
  import { DayOverviewQuery } from "$lib/queries/DayOverviewQuery"
  import type { NutritionInfo } from "$lib/models/meal"
  import { LocationService } from "$lib/services/LocationService"
  import {
    DiningCourtService,
    MAX_AUTO_SELECT_DISTANCE_METERS,
  } from "$lib/services/DiningCourtService"

  let description = $state("")
  let diningCourt = $state<string>("")
  let diningCourts = $state<DiningCourtLocation[]>([])
  let diningCourtsLoading = $state(true)
  let analyzing = $state(false)
  let result = $state<NutritionInfo | null>(null)
  let error = $state("")

  onMount(() => {
    void loadDiningCourts()
  })

  async function loadDiningCourts() {
    diningCourtsLoading = true
    try {
      diningCourts = (await getLocations()) as DiningCourtLocation[]
      const courtsWithCoordinates = diningCourts.flatMap((court) =>
        court.latitude != null && court.longitude != null
          ? [
              {
                name: court.name,
                latitude: court.latitude,
                longitude: court.longitude,
                category: court.category,
              },
            ]
          : [],
      )
      if (!courtsWithCoordinates.length) return
      try {
        const coordinates = await LocationService.get()
        diningCourt = await DiningCourtService.getNearestCourt(
          courtsWithCoordinates,
          coordinates,
          MAX_AUTO_SELECT_DISTANCE_METERS,
        )
      } catch {
        diningCourt = ""
      }
    } catch {
      diningCourts = []
      diningCourt = ""
    } finally {
      diningCourtsLoading = false
    }
  }

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

<div class="flex flex-col gap-6 p-5" style="font-family: 'DM Mono', monospace;">
  <div class="pt-2">
    <p class="text-xs tracking-[0.2em] text-zinc-500 uppercase">Manual Entry</p>
    <h1 class="text-2xl font-bold text-white">Describe Meal</h1>
  </div>

  <div class="flex flex-col gap-5 rounded-2xl border border-zinc-900 bg-zinc-950 p-5">
    <!-- Dining Court Select -->
    <div class="flex flex-col gap-2">
      <label class="text-xs tracking-[0.2em] text-zinc-400 uppercase" for="dining-court">
        Dining Court
      </label>
      <div class="flex items-center gap-2">
        <select
          id="dining-court"
          bind:value={diningCourt}
          disabled={diningCourtsLoading || diningCourts.length === 0}
          class="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/30 disabled:cursor-wait disabled:text-white/45"
        >
          <option value="">No dining court</option>
          {#each diningCourts as court}
            <option value={court.name}>{court.name}</option>
          {/each}
        </select>
        {#if diningCourt}
          <button
            onclick={() => (diningCourt = "")}
            class="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white transition-colors hover:border-zinc-500"
            type="button"
          >
            Clear
          </button>
        {/if}
      </div>
    </div>

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
        class="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-500"
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
</div>

{#if analyzing}
  <LoadingOverlay message="Analyzing food..." />
{/if}

{#if result}
  <ResultCard {result} onConfirm={handleConfirm} onDiscard={reset} />
{/if}
