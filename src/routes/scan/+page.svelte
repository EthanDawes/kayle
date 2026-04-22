<script lang="ts">
  import { goto } from "$app/navigation"
  import Camera from "$lib/UI/Camera.svelte"
  import LoadingOverlay from "$lib/UI/LoadingOverlay.svelte"
  import ResultCard from "$lib/UI/ResultCard.svelte"
  import { processScan } from "$lib/workflows/processScan"
  import { MealRepository } from "$lib/repositories/MealRepository"
  import { DayOverviewQuery } from "$lib/queries/DayOverviewQuery"
  import type { NutritionInfo } from "$lib/models/meal"

  type ScanState = "idle" | "processing" | "result" | "error"
  type ScanMode = "food" | "barcode"

  let state = $state<ScanState>("idle")
  let capturedImage = $state<string | null>(null)
  let capturedMode = $state<ScanMode>("food")
  let result = $state<NutritionInfo | null>(null)
  let error = $state("")
  let statusMessage = $state("Analyzing...")

  async function handleCapture(photo: string, mode: ScanMode) {
    capturedImage = photo
    capturedMode = mode
    state = "processing"
    statusMessage = mode === "barcode" ? "Detecting barcode..." : "Analyzing food..."

    try {
      result = await processScan(photo, mode)
      state = "result"
    } catch (err) {
      error = err instanceof Error ? err.message : "Analysis failed. Please try again."
      state = "error"
    }
  }

  async function handleConfirm() {
    if (!result) return
    await MealRepository.add({
      date: DayOverviewQuery.today(),
      timestamp: Date.now(),
      mode: capturedMode,
      name: result.name,
      calories: result.calories,
      protein: result.protein,
      fat: result.fat,
      carbs: result.carbs,
      servingSize: result.servingSize,
      description: result.description,
      brand: result.brand,
      imageDataUrl: capturedImage ?? undefined,
      source: result.source,
    })
    goto("/")
  }

  function reset() {
    result = null
    capturedImage = null
    error = ""
    state = "idle"
  }
</script>

<div class="relative h-full">
  <Camera onPhotoCaptured={handleCapture} />

  {#if state === "processing"}
    <LoadingOverlay message={statusMessage} />
  {/if}

  {#if state === "result" && result}
    <ResultCard
      {result}
      imageDataUrl={capturedImage ?? undefined}
      onConfirm={handleConfirm}
      onDiscard={reset}
    />
  {/if}

  {#if state === "error"}
    <div
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-zinc-950/95 p-8 backdrop-blur-sm"
      style="font-family: 'DM Mono', monospace;"
    >
      <svg class="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
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
