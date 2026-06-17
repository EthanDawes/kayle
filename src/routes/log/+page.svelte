<script lang="ts">
  import { goto } from "$app/navigation"
  import { resolve } from "$app/paths"
  import LoadingOverlay from "$lib/UI/LoadingOverlay.svelte"
  import ResultCard from "$lib/UI/ResultCard.svelte"
  import { processFoodPhoto } from "$lib/workflows/processFoodPhoto"
  import { MealRepository } from "$lib/repositories/MealRepository"
  import { DayOverviewQuery } from "$lib/queries/DayOverviewQuery"
  import type { NutritionInfo, Nutrients } from "$lib/models/meal"
  import MealSelector from "$lib/UI/components/MealSelector.svelte"
  import type { MealDescriptor } from "$lib/services/DiningCourtService"
  import NutritionLabel from "$lib/UI/NutritionLabel.svelte"
  import { DiningCourtService } from "$lib/services/DiningCourtService"
  import { toNutrients } from "$lib/services/DiningCourtService"
  import { sdk, getCurrentMeals } from "$lib/integrations/hfsGraphQL"

  let description = $state("")
  let diningCourt = $state<MealDescriptor>({
    date: DayOverviewQuery.today(),
    time: DayOverviewQuery.nowTime(),
    name: "",
  })
  let analyzing = $state(false)
  let result = $state<NutritionInfo | null>(null)
  let error = $state("")

  let menuLoading = $state(false)
  let stations = $state<any[]>([])
  let servingsOverride = $state<Record<string, number>>({})
  let itemDetails = $state<Record<string, { servingSize: string; baseNutrients: Nutrients }>>({})

  // Watch diningCourt change to load menu
  $effect(() => {
    const name = diningCourt.name
    const date = diningCourt.date
    const time = diningCourt.time
    if (name) {
      void loadMenu(name, date, time)
    } else {
      stations = []
      servingsOverride = {}
      itemDetails = {}
    }
  })

  async function loadMenu(location: string, date: string, time: string) {
    menuLoading = true
    error = ""
    try {
      const data = await sdk.getMenu({ location, date })
      const currentMeals = getCurrentMeals(data.diningCourtByName?.dailyMenu?.meals, {
        name: location,
        date,
        time,
      })

      const newStations: any[] = []
      const newItemDetails: Record<string, { servingSize: string; baseNutrients: Nutrients }> = {}

      for (const meal of currentMeals) {
        for (const station of meal.stations) {
          const stationName = station.name || "Station"
          const items = station.items.flatMap((entry) => {
            const list = []
            if (entry.item && entry.item.nutritionFacts) {
              list.push(entry.item)
            }
            if (entry.components) {
              for (const comp of entry.components) {
                if (comp.item && comp.item.nutritionFacts) {
                  list.push(comp.item)
                }
              }
            }
            return list
          })

          // Deduplicate items within the same station by name
          const seen = new Set()
          const uniqueItems = []
          for (const item of items) {
            if (!seen.has(item.name)) {
              seen.add(item.name)
              uniqueItems.push(item)

              const facts = item.nutritionFacts || []
              const servingSizeFact = facts.find(
                (f: any) => f.name?.toLowerCase() === "serving size",
              )
              newItemDetails[item.name] = {
                servingSize: servingSizeFact?.label || "",
                baseNutrients: toNutrients(facts as any),
              }
            }
          }

          if (uniqueItems.length > 0) {
            newStations.push({
              name: stationName,
              items: uniqueItems,
            })
          }
        }
      }

      stations = newStations
      itemDetails = { ...itemDetails, ...newItemDetails }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load dining court menu."
      stations = []
    } finally {
      menuLoading = false
    }
  }

  // Derived components with positive servings
  const editableComponents = $derived.by(() => {
    return Object.entries(servingsOverride)
      .filter(([_, servings]) => servings > 0 && !isNaN(servings))
      .map(([name, servings]) => {
        const details = itemDetails[name] || { servingSize: "", baseNutrients: {} as Nutrients }
        return {
          name,
          servings,
          servingSize: details.servingSize,
          baseNutrients: details.baseNutrients,
        }
      })
  })

  // Calculate scaled nutrients for mini label
  const scaledNutrients = $derived.by(() => {
    if (editableComponents.length > 0) {
      return editableComponents.reduce((acc, comp) => {
        return DiningCourtService.addNutrients(
          acc,
          DiningCourtService.multiplyNutrients({ ...comp.baseNutrients }, comp.servings),
        )
      }, {} as Nutrients)
    }
    return {} as Nutrients
  })

  async function analyze() {
    if (!description.trim()) return
    analyzing = true
    error = ""
    result = null

    try {
      const res = await processFoodPhoto(
        undefined,
        diningCourt.name ? diningCourt : undefined,
        description,
      )

      if (diningCourt.name) {
        const newOverrides = { ...servingsOverride }
        if (res.components) {
          for (const comp of res.components) {
            newOverrides[comp.name] = comp.servings
            if (!itemDetails[comp.name]) {
              itemDetails[comp.name] = {
                servingSize: comp.servingSize,
                baseNutrients: comp.baseNutrients,
              }
            }
          }
        }
        servingsOverride = newOverrides
        description = "" // Clear textbox on success
      } else {
        result = res
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Analysis failed. Please try again."
    } finally {
      analyzing = false
    }
  }

  async function saveDiningCourtMeal() {
    if (editableComponents.length === 0) return
    analyzing = true
    error = ""

    try {
      await MealRepository.add(
        $state.snapshot({
          date: DayOverviewQuery.today(),
          timestamp: Date.now(),
          name: diningCourt.name,
          nutrients: scaledNutrients,
          imageDataUrl: undefined,
          source: "openai",
          components: editableComponents.map((c) => ({ ...c })),
        }),
      )
      goto(resolve("/"))
    } catch (err) {
      error = err instanceof Error ? err.message : "Save failed. Please try again."
    } finally {
      analyzing = false
    }
  }

  function handleConfirm(scaledResult: NutritionInfo) {
    void (async () => {
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
    })()
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

  <!-- Single line description -->
  <div class="flex flex-col gap-2">
    <label class="text-xs tracking-[0.2em] text-zinc-400 uppercase" for="description">
      Describe what you ate
    </label>
    <input
      id="description"
      type="text"
      bind:value={description}
      placeholder="e.g. Scrambled eggs, wheat toast, orange juice..."
      class="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-500"
      onkeydown={(e) => {
        if (e.key === "Enter" && description.trim() && !analyzing) {
          analyze()
        }
      }}
    />
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
    Analyse
  </button>

  {#if diningCourt.name}
    <!-- Servings with quantities set -->
    {#if editableComponents.length > 0}
      <div class="mt-4">
        <h3 class="mb-3 text-xs tracking-[0.2em] text-zinc-400 uppercase">Selected Items</h3>
        <div class="mb-4 space-y-2">
          {#each editableComponents as comp (comp.name)}
            <div class="flex items-center gap-2">
              <span class="min-w-0 flex-1 truncate text-sm text-zinc-300">{comp.name}</span>
              <span class="shrink-0 text-xs text-zinc-500">{comp.servingSize}</span>
              <input
                type="number"
                min="0"
                step="0.25"
                value={comp.servings}
                oninput={(e) => {
                  servingsOverride[comp.name] = Number(e.currentTarget.value)
                }}
                class="w-20 shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-zinc-500"
              />
            </div>
          {/each}
        </div>

        <!-- Mini nutrition label -->
        <div class="mb-4 flex justify-center">
          <NutritionLabel {...scaledNutrients} class="w-full max-w-sm" />
        </div>

        <!-- Save button -->
        <button
          onclick={saveDiningCourtMeal}
          class="mb-4 w-full rounded-full bg-white py-3 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
          type="button"
        >
          Save Meal
        </button>
      </div>
    {/if}

    <hr class="my-4 border-zinc-800" />

    <!-- All items in dining court, grouped by station -->
    {#if menuLoading}
      <div class="py-8 text-center text-sm text-zinc-500">Loading menu...</div>
    {:else if stations.length === 0}
      <div class="py-8 text-center text-sm text-zinc-500">
        No menu items found for the selected date/time.
      </div>
    {:else}
      <div class="space-y-6">
        {#each stations as station (station.name)}
          <div>
            <h3
              class="mb-2 border-b border-zinc-800 pb-1 text-sm font-bold tracking-wider text-zinc-400 uppercase"
            >
              {station.name}
            </h3>
            <div class="space-y-2">
              {#each station.items as item (item.name)}
                {@const details = itemDetails[item.name]}
                {@const servingSize = details?.servingSize || ""}
                <div class="flex items-center gap-2">
                  <span class="min-w-0 flex-1 truncate text-sm text-zinc-300">{item.name}</span>
                  <span class="shrink-0 text-xs text-zinc-500">{servingSize}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={servingsOverride[item.name] ?? 0}
                    oninput={(e) => {
                      servingsOverride[item.name] = Number(e.currentTarget.value)
                    }}
                    class="w-20 shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white outline-none focus:border-zinc-500"
                  />
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

{#if analyzing}
  <LoadingOverlay message="Analyzing food..." />
{/if}

{#if result && !diningCourt.name}
  <ResultCard {result} onConfirm={handleConfirm} onDiscard={reset} />
{/if}
