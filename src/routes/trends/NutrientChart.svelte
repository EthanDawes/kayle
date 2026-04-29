<script lang="ts">
  import { onMount } from "svelte"
  import type { Chart, ChartConfiguration } from "chart.js"
  import { DAILY_VALUES } from "$lib"
  import Spinner from "$lib/UI/components/Spinner.svelte"
  import { NutrientTrendsQuery, type NutrientTrendPoint } from "$lib/queries/NutrientTrendsQuery"
  import type { NumericNutrientKey } from "$lib/services/DiningCourtService"

  let { nutrient }: { nutrient: NumericNutrientKey } = $props()

  let trendPoints = $state<NutrientTrendPoint[]>([])
  let loading = $state(true)
  let error = $state("")
  let canvas = $state<HTMLCanvasElement | null>(null)

  let chartInstance: Chart | null = null
  let chartFactory: typeof Chart | null = null
  let mounted = false

  const label = $derived(NutrientTrendsQuery.labelFor(nutrient))
  const dailyValue = $derived(DAILY_VALUES[nutrient])
  const labels = $derived(trendPoints.map((p) => p.label))
  const values = $derived(trendPoints.map((p) => p.value))
  const dailyValueLine = $derived(labels.map(() => dailyValue))
  const total = $derived(values.reduce((a, b) => a + b, 0))
  const peak = $derived(Math.max(...values, 0))

  async function load() {
    loading = true
    error = ""
    try {
      trendPoints = await NutrientTrendsQuery.forPastWeek(nutrient)
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load trends."
    } finally {
      loading = false
    }
  }

  async function ensureChartFactory() {
    if (chartFactory) return chartFactory
    const mod = await import("chart.js/auto")
    chartFactory = mod.Chart
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
            label,
            data: values,
            borderColor: "#ea580c",
            backgroundColor: "rgba(251,146,60,0.18)",
            borderWidth: 3,
            pointRadius: 4,
            tension: 0.35,
            fill: true,
          },
          {
            label: `${label} DV`,
            data: dailyValueLine,
            borderColor: "#94a3b8",
            borderDash: [6, 6],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
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
    load()

    return () => {
      mounted = false
      resetChart()
    }
  })

  $effect(() => {
    labels
    values
    dailyValueLine
    canvas
    void syncChart()
  })
</script>

<section class="mt-6 rounded-[28px] border border-amber-200 bg-white/90 p-4 shadow">
  <h2 class="text-xl font-semibold text-stone-950">{label}</h2>

  {#if loading}
    <div class="flex h-48 items-center justify-center">
      <Spinner />
    </div>
  {:else if error}
    <div class="text-sm text-red-700">{error}</div>
  {:else}
    <div class="h-64">
      <canvas bind:this={canvas}></canvas>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3 text-xs text-stone-600">
      <div class="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
        <p class="text-stone-500 uppercase">7-day total</p>
        <p class="text-lg text-stone-950">{total.toFixed(2)}</p>
      </div>
      <div class="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
        <p class="text-stone-500 uppercase">Peak Day</p>
        <p class="text-lg text-stone-950">{peak.toFixed(2)}</p>
      </div>
      <div class="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
        <p class="text-stone-500 uppercase">DV</p>
        <p class="text-lg text-stone-950">{dailyValue.toFixed(2)}</p>
      </div>
    </div>
  {/if}
</section>
