<script lang="ts">
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import Camera from "$lib/UI/Camera.svelte"
  import LoadingOverlay from "$lib/UI/LoadingOverlay.svelte"
  import ResultCard from "$lib/UI/ResultCard.svelte"
  import { getLocations, type DiningCourtLocation } from "$lib/integrations/hfsGraphQL"
  import { processScan } from "$lib/workflows/processScan"
  import { MealRepository } from "$lib/repositories/MealRepository"
  import { DayOverviewQuery } from "$lib/queries/DayOverviewQuery"
  import type { NutritionInfo } from "$lib/models/meal"
  import { LocationService } from "$lib/services/LocationService"
  import {
    DiningCourtService,
    MAX_AUTO_SELECT_DISTANCE_METERS,
  } from "$lib/services/DiningCourtService"
  import { resolve } from "$app/paths"

  type ScanState = "idle" | "processing" | "result" | "error"
  type ScanMode = "food" | "barcode"

  let cameraState = $state<ScanState>("idle")
  let capturedImage = $state<string | null>(null)
  let diningCourt = $state<string>("")
  let diningCourts = $state<DiningCourtLocation[]>([])
  let diningCourtsLoading = $state(true)
  let result = $state<NutritionInfo | null>(null)
  let error = $state("")
  let statusMessage = $state("Analyzing...")

  onMount(() => {
    void loadDiningCourts()
  })

  async function loadDiningCourts() {
    diningCourtsLoading = true

    try {
      diningCourts = (await getLocations()) as DiningCourtLocation[]

      const courtsWithCoordinates = diningCourts.flatMap((court) =>
        court.latitude != null && court.longitude != null
          ? [{ name: court.name, latitude: court.latitude, longitude: court.longitude }]
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

  async function handleCapture(photo: string, mode: ScanMode) {
    capturedImage = photo
    cameraState = "processing"
    statusMessage = mode === "barcode" ? "Detecting barcode..." : "Analyzing food..."

    try {
      result = await processScan(photo, mode, diningCourt || undefined)
      cameraState = "result"
    } catch (err) {
      error = err instanceof Error ? err.message : "Analysis failed. Please try again."
      cameraState = "error"
    }
  }

  async function handleConfirm() {
    if (!result) return
    await MealRepository.add(
      $state.snapshot({
        date: DayOverviewQuery.today(),
        timestamp: Date.now(),
        name: result.name,
        nutrients: result.nutrients,
        description: result.description,
        imageDataUrl: capturedImage ?? undefined,
        source: result.source,
      }),
    )
    goto(resolve("/"))
  }

  function reset() {
    result = null
    capturedImage = null
    error = ""
    cameraState = "idle"
  }
</script>

<svelte:head>
  <title>Kayle Scan</title>
</svelte:head>

<div class="relative h-full">
  <div class="pointer-events-none absolute inset-x-0 top-0 z-30 p-4">
    <div
      class="pointer-events-auto flex items-center gap-2 rounded-3xl border border-white/10 bg-black/45 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
      style="font-family: 'DM Mono', monospace;"
    >
      <select
        bind:value={diningCourt}
        disabled={diningCourtsLoading || diningCourts.length === 0}
        class="min-w-0 flex-1 rounded-full border border-white/10 bg-white/8 px-4 py-2.5 text-sm text-white transition-colors outline-none disabled:cursor-wait disabled:text-white/45"
      >
        <option class="bg-black/45" value="">No dining court</option>
        {#each diningCourts as court}
          <option class="bg-black/45" value={court.name}>{court.name}</option>
        {/each}
      </select>

      <button
        onclick={() => (diningCourt = "")}
        disabled={!diningCourt}
        class="shrink-0 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
      >
        Unset
      </button>
    </div>
  </div>

  <Camera onPhotoCaptured={handleCapture} />

  {#if cameraState === "processing"}
    <LoadingOverlay message={statusMessage} />
  {/if}

  {#if cameraState === "result" && result}
    <ResultCard
      {result}
      imageDataUrl={capturedImage ?? undefined}
      onConfirm={handleConfirm}
      onDiscard={reset}
    />
  {/if}

  {#if cameraState === "error"}
    <div
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-zinc-950/95 p-8 backdrop-blur-sm"
      style="font-family: 'DM Mono', monospace;"
    >
      <svg
        class="h-10 w-10 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p class="text-center text-sm leading-relaxed text-zinc-300">{error}</p>
      <button
        onclick={reset}
        class="rounded-full border border-zinc-700 px-6 py-2.5 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
      >
        Try Again
      </button>
    </div>
  {/if}
</div>
