<script lang="ts">
  import { DAILY_VALUES } from "$lib"
  import type { Nutrients } from "$lib/models/meal"

  type NutrientKey = keyof typeof DAILY_VALUES

  interface NutritionProps extends Nutrients {
    servingSize?: string
    servingsPerContainer?: number
  }

  let {
    servingSize = "",
    servingsPerContainer = 0,
    calories = 0,
    totalFat = 0,
    saturatedFat = 0,
    transFat = 0,
    cholesterol = 0,
    sodium = 0,
    totalCarbohydrate = 0,
    dietaryFiber = 0,
    totalSugars = 0,
    addedSugars = 0,
    protein = 30,
    vitaminD = 0,
    calcium = 0,
    iron = 0,
    potassium = 0,
  }: NutritionProps = $props()

  function pct(key: NutrientKey, consumed: number): number {
    const dv = DAILY_VALUES[key]
    if (!dv || dv === 0) return 0
    return Math.min(100, Math.round((consumed / dv) * 100))
  }

  function fmt(grams: number, unit: "g" | "mg" | "mcg" = "g"): string {
    if (unit === "mg") return `${Math.round(grams * 1000)}mg`
    if (unit === "mcg") return `${Math.round(grams * 1_000_000)}mcg`
    return `${grams}g`
  }

  function dvFmt(key: NutrientKey, unit: "g" | "mg" | "mcg" = "g"): string {
    return fmt(DAILY_VALUES[key], unit)
  }

  // Color based on % of DV
  function barColor(p: number): string {
    if (p >= 80) return "#ef4444" // red — high
    if (p >= 50) return "#f97316" // orange — moderate
    if (p >= 20) return "#eab308" // yellow — low-moderate
    return "#22c55e" // green — low
  }

  type Row = {
    label: string
    key: NutrientKey
    consumed: number
    unit: "g" | "mg" | "mcg"
    indent?: boolean
    bold?: boolean
    border?: "thick" | "thin" | "none"
    sub?: boolean // sub-label style
  }

  const mainRows: Row[] = $derived([
    {
      label: "Total Fat",
      key: "totalFat",
      consumed: totalFat,
      unit: "g",
      bold: true,
      border: "thick",
    },
    {
      label: "Saturated Fat",
      key: "saturatedFat",
      consumed: saturatedFat,
      unit: "g",
      indent: true,
      border: "thin",
    },
    {
      label: "Trans Fat",
      key: "transFat",
      consumed: transFat,
      unit: "g",
      indent: true,
      border: "thin",
    },
    {
      label: "Cholesterol",
      key: "cholesterol",
      consumed: cholesterol,
      unit: "mg",
      bold: true,
      border: "thick",
    },
    { label: "Sodium", key: "sodium", consumed: sodium, unit: "mg", bold: true, border: "thick" },
    {
      label: "Total Carbohydrate",
      key: "totalCarbohydrate",
      consumed: totalCarbohydrate,
      unit: "g",
      bold: true,
      border: "thick",
    },
    {
      label: "Dietary Fiber",
      key: "dietaryFiber",
      consumed: dietaryFiber,
      unit: "g",
      indent: true,
      border: "thin",
    },
    {
      label: "Total Sugars",
      key: "totalSugars",
      consumed: totalSugars,
      unit: "g",
      indent: true,
      border: "thin",
    },
    {
      label: "Includes Added Sugars",
      key: "addedSugars",
      consumed: addedSugars,
      unit: "g",
      indent: true,
      sub: true,
      border: "thin",
    },
    { label: "Protein", key: "protein", consumed: protein, unit: "g", bold: true, border: "thick" },
  ])

  const microRows: Row[] = $derived([
    { label: "Vitamin D", key: "vitaminD", consumed: vitaminD, unit: "mcg", border: "thin" },
    { label: "Calcium", key: "calcium", consumed: calcium, unit: "mg", border: "thin" },
    { label: "Iron", key: "iron", consumed: iron, unit: "mg", border: "thin" },
    { label: "Potassium", key: "potassium", consumed: potassium, unit: "mg", border: "none" },
  ])
</script>

<div
  class="w-85 border-[3px] border-zinc-900 bg-white px-2 pt-1.5 pb-1 font-['Barlow_Condensed',sans-serif] text-zinc-900 shadow-[4px_4px_0_#111] select-none"
>
  <!-- Header -->
  <div class="mb-0.5 border-b-10 border-zinc-900 pb-1">
    <div class="text-[2.6rem] leading-none font-black tracking-[-0.5px]">Nutrition Facts</div>

    <div class="flex flex-col gap-px text-[0.85rem] font-semibold">
      <span>{servingsPerContainer} servings per container</span>

      <div class="flex justify-between text-base font-bold">
        <span>Serving size</span>
        <span>{servingSize}</span>
      </div>
    </div>
  </div>

  <!-- Calories -->
  <div class="flex items-end justify-between border-b-[5px] border-zinc-900 py-0.75 pb-1">
    <div class="flex flex-col leading-tight">
      <span class="barlow text-[0.72rem] font-semibold"> Amount per serving </span>
      <span class="text-[1.6rem] font-extrabold">Calories</span>
    </div>

    <span class="text-[3.2rem] leading-none font-black">{calories}</span>
  </div>

  <!-- DV Header -->
  <div class="barlow border-b border-zinc-900 py-0.5 text-right text-[0.72rem] font-bold">
    % Daily Value*
  </div>

  <!-- Main nutrients -->
  {#each mainRows as row}
    {@const p = pct(row.key, row.consumed)}
    {@const color = barColor(p)}
    <div
      class={`relative min-h-6.5 overflow-hidden
      ${
        row.border === "thick"
          ? "border-b-[5px] border-zinc-900"
          : row.border === "none"
            ? ""
            : "border-b border-zinc-300"
      }`}
      style={`--bar-pct:${p}%; --bar-color:${color};`}
    >
      <div
        class="absolute inset-0 w-(--bar-pct) bg-(--bar-color) opacity-20 transition-all duration-500"
      ></div>

      <div
        class={`relative z-10 flex items-center justify-between py-0.75 pr-0.5
        ${row.sub ? "pl-8" : row.indent ? "pl-4.5" : "pl-1"}`}
      >
        <span class={row.bold ? "text-base font-extrabold" : "barlow text-[0.9rem] font-semibold"}>
          {row.label}
          <span class="font-bold"> {fmt(row.consumed, row.unit)}</span>
        </span>

        {#if DAILY_VALUES[row.key] > 0}
          <span class="text-[0.78rem] font-bold whitespace-nowrap text-zinc-800">
            {fmt(row.consumed, row.unit)} / {dvFmt(row.key, row.unit)}
          </span>
        {/if}
      </div>
    </div>
  {/each}

  <!-- Divider -->
  <div class="border-b-8 border-zinc-900"></div>

  <!-- Micronutrients -->
  {#each microRows as row}
    {@const p = pct(row.key, row.consumed)}
    {@const color = barColor(p)}

    <div
      class={`relative min-h-6.5 overflow-hidden ${
        row.border === "none" ? "" : "border-b border-zinc-300"
      }`}
      style={`--bar-pct:${p}%; --bar-color:${color};`}
    >
      <div
        class="absolute inset-0 w-(--bar-pct) bg-(--bar-color) opacity-20 transition-all duration-500"
      ></div>

      <div class="relative z-10 flex items-center justify-between px-1 py-0.75">
        <span class="text-[0.95rem] font-bold">{row.label}</span>

        <span class="text-[0.78rem] font-bold whitespace-nowrap text-zinc-800">
          {fmt(row.consumed, row.unit)} / {dvFmt(row.key, row.unit)}
        </span>
      </div>
    </div>
  {/each}

  <!-- Footer note -->
  <p
    class="barlow mt-1 border-t-[3px] border-zinc-900 pt-1 text-[0.62rem] leading-[1.3] text-zinc-700"
  >
    * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a
    daily diet. 2,000 calories a day is used for general nutrition advice.
  </p>
</div>

<style>
  .barlow {
    font-family: "Barlow", sans-serif;
  }
</style>
