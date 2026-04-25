<script lang="ts">
  import { onMount } from "svelte"
  import type { Chart, ChartConfiguration } from "chart.js"
  import Spinner from "$lib/UI/components/Spinner.svelte"
  import { NutrientTrendsQuery, type NutrientTrendPoint } from "$lib/queries/NutrientTrendsQuery"
  import {
    NUMERIC_NUTRIENT_KEYS,
    type NumericNutrientKey,
  } from "$lib/services/DiningCourtService"

  let selectedNutrient = $state<NumericNutrientKey>(NUMERIC_NUTRIENT_KEYS[0])
  let trendPoints = $state<NutrientTrendPoint[]>([])
  let loading = $state(true)
  let error = $state("")
  let canvas = $state<HTMLCanvasElement | null>(null)
  let chartInstance: Chart | null = null
  let chartFactory: typeof Chart | null = null
  let mounted = false

  const chartLabel = $derived(NutrientTrendsQuery.labelFor(selectedNutrient))
  const labels = $derived(trendPoints.map((point) => point.label))
  const values = $derived(trendPoints.map((point) => point.value))
  const sevenDayTotal = $derived(values.reduce((sum, value) => sum + value, 0))
  const peakDayValue = $derived(Math.max(...values, 0))

  async function loadTrend() {
    loading = true
    error = ""

    try {
      trendPoints = await NutrientTrendsQuery.forPastWeek(selectedNutrient)
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load trends."
    } finally {
      loading = false
    }
  }

  async function ensureChartFactory() {
    if (chartFactory) return chartFactory
    const chartModule = await import("chart.js/auto")
    chartFactory = chartModule.Chart
    return chartFactory
  }

  async function syncChart() {
    if (!mounted || !canvas || loading || error) return

    const ChartClass = await ensureChartFactory()
    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: chartLabel,
            data: values,
            borderColor: "#f97316",
            backgroundColor: "rgba(249, 115, 22, 0.18)",
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#fff7ed",
            pointBorderColor: "#f97316",
            pointBorderWidth: 2,
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label(context) {
                return `${chartLabel}: ${context.parsed.y}`
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
            ticks: {
              color: "#a1a1aa",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
            ticks: {
              color: "#a1a1aa",
            },
          },
        },
      },
    }

    if (chartInstance) {
      chartInstance.data = config.data
      chartInstance.options = config.options ?? {}
      chartInstance.update()
      return
    }

    chartInstance = new ChartClass(canvas, config)
  }

  onMount(() => {
    mounted = true

    return () => {
      mounted = false
      chartInstance?.destroy()
      chartInstance = null
    }
  })

  $effect(() => {
    selectedNutrient
    void loadTrend()
  })

  $effect(() => {
    labels
    values
    chartLabel
    void syncChart()
  })
</script>

<svelte:head>
  <title>Kayle Trends</title>
</svelte:head>

<div class="flex h-full flex-col gap-6 px-4 py-5" style="font-family: 'DM Mono', monospace;">
  <header class="space-y-2">
    <p class="text-xs tracking-[0.2em] text-zinc-500 uppercase">Past 7 Days</p>
    <h1 class="text-2xl font-bold text-white">Nutrient Trends</h1>
    <p class="text-sm text-zinc-400">Track one nutrient across your logged meals.</p>
  </header>

  <label class="flex flex-col gap-2">
    <span class="text-xs tracking-[0.16em] text-zinc-500 uppercase">Nutrient</span>
    <select
      bind:value={selectedNutrient}
      class="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
    >
      {#each NUMERIC_NUTRIENT_KEYS as nutrient}
        <option value={nutrient}>{NutrientTrendsQuery.labelFor(nutrient)}</option>
      {/each}
    </select>
  </label>

  <section class="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
    <div class="mb-4">
      <p class="text-xs tracking-[0.18em] text-zinc-500 uppercase">Selected</p>
      <h2 class="text-xl font-semibold text-white">{chartLabel}</h2>
    </div>

    {#if loading}
      <div class="flex h-72 items-center justify-center">
        <Spinner />
      </div>
    {:else if error}
      <div class="flex h-72 items-center justify-center text-center text-sm text-red-300">
        {error}
      </div>
    {:else}
      <div class="h-72">
        <canvas bind:this={canvas}></canvas>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-400">
        <div class="rounded-2xl border border-zinc-800 bg-black/20 p-3">
          <p class="tracking-[0.16em] text-zinc-500 uppercase">7-day total</p>
          <p class="mt-2 text-lg text-white">{sevenDayTotal.toFixed(2)}</p>
        </div>
        <div class="rounded-2xl border border-zinc-800 bg-black/20 p-3">
          <p class="tracking-[0.16em] text-zinc-500 uppercase">Peak day</p>
          <p class="mt-2 text-lg text-white">{peakDayValue.toFixed(2)}</p>
        </div>
      </div>
    {/if}
  </section>
</div>
