<script lang="ts">
  import { onMount } from "svelte"
  import { DayOverviewQuery, type DayOverview } from "$lib/queries/DayOverviewQuery"
  import { MealRepository } from "$lib/repositories/MealRepository"
  import MealCard from "$lib/UI/MealCard.svelte"

  const CAL_GOAL = 2000
  const PROTEIN_GOAL = 150
  const CIRCUMFERENCE = 2 * Math.PI * 32

  let overview = $state<DayOverview | null>(null)
  let loading = $state(true)

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

  const calPct = $derived(overview ? Math.min(100, (overview.totalCalories / CAL_GOAL) * 100) : 0)
  const dashOffset = $derived(CIRCUMFERENCE * (1 - calPct / 100))
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
</script>

<div class="flex flex-col gap-6 p-5" style="font-family: 'DM Mono', monospace;">
  <!-- Header -->
  <div class="pt-2">
    <p class="text-xs tracking-[0.2em] text-zinc-500 uppercase">{todayLabel}</p>
    <h1 class="text-2xl font-bold text-white">Today</h1>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-16">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80"></div>
    </div>
  {:else if overview}
    <!-- Summary card -->
    <div class="rounded-2xl bg-zinc-900 p-5">
      <div class="flex items-center gap-5">
        <!-- Calorie ring -->
        <div class="relative shrink-0">
          <svg class="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#27272a" stroke-width="8" />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="white"
              stroke-width="8"
              stroke-dasharray={CIRCUMFERENCE}
              stroke-dashoffset={dashOffset}
              stroke-linecap="round"
              class="transition-all duration-700"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-base font-bold text-white">{Math.round(calPct)}%</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex-1">
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-bold text-white">{Math.round(overview.totalCalories)}</span>
            <span class="text-xs text-zinc-500">/ {CAL_GOAL} kcal</span>
          </div>
          <p class="mt-1 text-xs text-zinc-500">
            {overview.mealCount} meal{overview.mealCount !== 1 ? "s" : ""} logged
          </p>
          <div class="mt-3 grid grid-cols-3 gap-1 text-xs">
            {#each [
              { label: "Protein", value: overview.totalProtein, goal: PROTEIN_GOAL, color: "#3b82f6" },
              { label: "Carbs", value: overview.totalCarbs, goal: 275, color: "#f59e0b" },
              { label: "Fat", value: overview.totalFat, goal: 78, color: "#ef4444" },
            ] as m (m.label)}
              <div>
                <p class="text-zinc-600">{m.label}</p>
                <p class="font-semibold text-white">{m.value.toFixed(0)}g</p>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Meal list -->
    {#if overview.meals.length > 0}
      <div class="flex flex-col gap-2">
        <p class="text-xs tracking-[0.2em] text-zinc-600 uppercase">Meals</p>
        {#each [...overview.meals].reverse() as meal (meal.id)}
          <MealCard {meal} onDelete={deleteMeal} />
        {/each}
      </div>
    {:else}
      <div class="flex flex-col items-center gap-2 py-16 text-center">
        <span class="text-5xl">🍽</span>
        <p class="text-sm text-zinc-500">Nothing logged yet.</p>
        <p class="text-xs text-zinc-600">Tap Scan to get started.</p>
      </div>
    {/if}
  {/if}
</div>
