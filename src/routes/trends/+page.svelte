<script lang="ts">
  import { onMount } from "svelte"
  import type { Chart, ChartConfiguration } from "chart.js"
  import { DAILY_VALUES } from "$lib"
  import Spinner from "$lib/UI/components/Spinner.svelte"
  import { NutrientTrendsQuery, type NutrientTrendPoint } from "$lib/queries/NutrientTrendsQuery"
  import { NUMERIC_NUTRIENT_KEYS, type NumericNutrientKey } from "$lib/services/DiningCourtService"

  let selectedNutrient = $state<NumericNutrientKey>(NUMERIC_NUTRIENT_KEYS[0])
  let trendPoints = $state<NutrientTrendPoint[]>([])
  let loading = $state(true)
  let error = $state("")
  let canvas = $state<HTMLCanvasElement | null>(null)
  let chartInstance: Chart | null = null
  let chartFactory: typeof Chart | null = null
  let mounted = false

  const chartLabel = $derived(NutrientTrendsQuery.labelFor(selectedNutrient))
  const dailyValue = $derived(DAILY_VALUES[selectedNutrient])
  const labels = $derived(trendPoints.map((point) => point.label))
  const values = $derived(trendPoints.map((point) => point.value))
  const dailyValueLine = $derived(labels.map(() => dailyValue))
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
            borderColor: "#ea580c",
            backgroundColor: "rgba(251, 146, 60, 0.18)",
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#fff7ed",
            pointBorderColor: "#ea580c",
            pointBorderWidth: 2,
            fill: true,
            tension: 0.35,
          },
          {
            label: `${chartLabel} DV`,
            data: dailyValueLine,
            borderColor: "#94a3b8",
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#475569",
              boxWidth: 14,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "#fff7ed",
            titleColor: "#431407",
            bodyColor: "#7c2d12",
            borderColor: "#fdba74",
            borderWidth: 1,
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${context.parsed.y}`
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(148, 163, 184, 0.2)",
            },
            ticks: {
              color: "#64748b",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(148, 163, 184, 0.2)",
            },
            ticks: {
              color: "#64748b",
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

  function resetChart() {
    chartInstance?.destroy()
    chartInstance = null
  }

  onMount(() => {
    mounted = true

    return () => {
      mounted = false
      resetChart()
    }
  })

  $effect(() => {
    selectedNutrient
    resetChart()
    void loadTrend()
  })

  $effect(() => {
    labels
    values
    dailyValueLine
    chartLabel
    canvas
    void syncChart()
  })
</script>

<svelte:head>
  <title>Kayle Trends</title>
</svelte:head>

<div
  class="min-h-full bg-linear-to-b from-amber-50 via-orange-50 to-stone-100 px-4 py-5 text-stone-900"
  style="font-family: 'DM Mono', monospace;"
>
  <header class="space-y-2">
    <p class="text-xs tracking-[0.2em] text-amber-700 uppercase">Past 7 Days</p>
    <h1 class="text-2xl font-bold text-stone-950">Nutrient Trends</h1>
    <p class="text-sm text-stone-600">Track one nutrient across your logged meals.</p>
  </header>

  <label class="flex flex-col gap-2">
    <span class="text-xs tracking-[0.16em] text-stone-500 uppercase">Nutrient</span>
    <select
      bind:value={selectedNutrient}
      class="mb-2 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-stone-900 transition outline-none focus:border-orange-400"
    >
      {#each NUMERIC_NUTRIENT_KEYS as nutrient}
        <option value={nutrient}>{NutrientTrendsQuery.labelFor(nutrient)}</option>
      {/each}
    </select>
  </label>

  <section
    class="rounded-[28px] border border-amber-200 bg-white/90 p-4 shadow-[0_24px_80px_rgba(120,53,15,0.12)]"
  >
    <div class="mb-4">
      <p class="text-xs tracking-[0.18em] text-stone-500 uppercase">Selected</p>
      <h2 class="text-xl font-semibold text-stone-950">{chartLabel}</h2>
    </div>

    {#if loading}
      <div class="flex h-72 items-center justify-center">
        <Spinner />
      </div>
    {:else if error}
      <div class="flex h-72 items-center justify-center text-center text-sm text-red-700">
        {error}
      </div>
    {:else}
      <div class="h-72 min-h-72">
        <canvas bind:this={canvas}></canvas>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-3 text-xs text-stone-600">
        <div class="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
          <p class="tracking-[0.16em] text-stone-500 uppercase">7-day total</p>
          <p class="mt-2 text-lg text-stone-950">{sevenDayTotal.toFixed(2)}</p>
        </div>
        <div class="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
          <p class="tracking-[0.16em] text-stone-500 uppercase">Peak day</p>
          <p class="mt-2 text-lg text-stone-950">{peakDayValue.toFixed(2)}</p>
        </div>
        <div class="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
          <p class="tracking-[0.16em] text-stone-500 uppercase">Daily value</p>
          <p class="mt-2 text-lg text-stone-950">{dailyValue.toFixed(2)}</p>
        </div>
      </div>
    {/if}
  </section>
</div>
