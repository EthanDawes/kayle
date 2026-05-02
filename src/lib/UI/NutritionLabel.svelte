<script lang="ts">
  import { DAILY_VALUES } from "$lib"
  import type { Nutrients } from "$lib/models/meal"
  import type { NumericNutrientKey } from "$lib/services/DiningCourtService"
  import { formatNutrientValue } from "$lib/utils/nutrientUnits"

  type NutrientKey = Exclude<keyof typeof DAILY_VALUES, "servingSize" | "servingsPerContainer">

  interface NutritionProps extends Nutrients {
    servingSize?: string
    class?: string
    onNutrientClick?: (nutrient: NumericNutrientKey, label: string) => void
    colorCode?: boolean
  }

  let {
    class: className = "",
    onNutrientClick = undefined,
    colorCode = true,
    servingSize = "",
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
    protein = 0,
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

  function whole(value: number): number {
    return Math.round(value)
  }

  function fmt(key: NutrientKey, value: number): string {
    return formatNutrientValue(key, value)
  }

  function dvFmt(key: NutrientKey): string {
    return formatNutrientValue(key, DAILY_VALUES[key])
  }

  // Color based on % of DV
  function barColor(p: number): string {
    if (!colorCode) return "#3b82f6"
    if (p >= 80) return "#ef4444" // red — high
    if (p >= 50) return "#f97316" // orange — moderate
    if (p >= 20) return "#eab308" // yellow — low-moderate
    return "#22c55e" // green — low
  }

  type Row = {
    label: string
    key: NutrientKey
    consumed: number
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
      bold: true,
      border: "thick",
    },
    {
      label: "Saturated Fat",
      key: "saturatedFat",
      consumed: saturatedFat,
      indent: true,
      border: "thin",
    },
    {
      label: "Trans Fat",
      key: "transFat",
      consumed: transFat,
      indent: true,
      border: "thin",
    },
    {
      label: "Cholesterol",
      key: "cholesterol",
      consumed: cholesterol,
      bold: true,
      border: "thick",
    },
    {
      label: "Sodium",
      key: "sodium",
      consumed: sodium,
      bold: true,
      border: "thick",
    },
    {
      label: "Total Carbohydrate",
      key: "totalCarbohydrate",
      consumed: totalCarbohydrate,
      bold: true,
      border: "thick",
    },
    {
      label: "Dietary Fiber",
      key: "dietaryFiber",
      consumed: dietaryFiber,
      indent: true,
      border: "thin",
    },
    {
      label: "Total Sugars",
      key: "totalSugars",
      consumed: totalSugars,
      indent: true,
      border: "thin",
    },
    {
      label: "Includes Added Sugars",
      key: "addedSugars",
      consumed: addedSugars,
      indent: true,
      sub: true,
      border: "thin",
    },
    {
      label: "Protein",
      key: "protein",
      consumed: protein,
      bold: true,
      border: "thick",
    },
  ])

  const microRows: Row[] = $derived([
    { label: "Vitamin D", key: "vitaminD", consumed: vitaminD, border: "thin" },
    { label: "Calcium", key: "calcium", consumed: calcium, border: "thin" },
    { label: "Iron", key: "iron", consumed: iron, border: "thin" },
    { label: "Potassium", key: "potassium", consumed: potassium, border: "none" },
  ])
</script>

<div class="nutrition-label {className}">
  <!-- Header -->
  <div class="header">
    <div class="title">Nutrition Facts</div>
    <div class="serving-info">
      <div class="serving-size-row">
        <span class="serving-size-label">Serving size</span>
        <span class="serving-size-val">{servingSize}</span>
      </div>
    </div>
  </div>

  <!-- Calories -->
  <button
    type="button"
    class="calories-block nutrient-button"
    class:clickable={!!onNutrientClick}
    onclick={() => onNutrientClick?.("calories", "Calories")}
  >
    <div class="calories-header">
      <span class="amt-per">Amount per serving</span>
      <span class="calories-word">Calories</span>
    </div>
    <span class="calories-num">{whole(calories)}</span>
  </button>

  <div class="dv-header">% Daily Value*</div>

  <!-- Main nutrients -->
  {#each mainRows as row}
    {@const p = pct(row.key, row.consumed)}
    {@const color = barColor(p)}
    <button
      type="button"
      class="nutrient-row nutrient-button"
      class:clickable={!!onNutrientClick}
      class:indent={row.indent}
      class:sub={row.sub}
      class:thick-border={row.border === "thick"}
      style="--bar-pct: {p}%; --bar-color: {color};"
      onclick={() => onNutrientClick?.(row.key, row.label)}
    >
      <div class="bar-bg"></div>
      <div class="row-content">
        <span class="nutrient-name" class:bold={row.bold}>
          {row.label}
          <span class="amount"> {fmt(row.key, row.consumed)}</span>
        </span>
        {#if DAILY_VALUES[row.key] > 0}
          <span class="dv-text">
            {fmt(row.key, row.consumed)} / {dvFmt(row.key)}
          </span>
        {/if}
      </div>
    </button>
  {/each}

  <!-- Divider -->
  <div class="thick-divider"></div>

  <!-- Micronutrients -->
  {#each microRows as row}
    {@const p = pct(row.key, row.consumed)}
    {@const color = barColor(p)}
    <button
      type="button"
      class="nutrient-row micro nutrient-button"
      class:clickable={!!onNutrientClick}
      style="--bar-pct: {p}%; --bar-color: {color};"
      class:no-border={row.border === "none"}
      onclick={() => onNutrientClick?.(row.key, row.label)}
    >
      <div class="bar-bg"></div>
      <div class="row-content">
        <span class="nutrient-name">{row.label}</span>
        <span class="dv-text">
          {fmt(row.key, row.consumed)} / {dvFmt(row.key)}
        </span>
      </div>
    </button>
  {/each}

  <!-- Footer note -->
  <p class="footnote">
    * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a
    daily diet. 2,000 calories a day is used for general nutrition advice.
  </p>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;600&display=swap");

  .nutrition-label {
    font-family: "Barlow Condensed", sans-serif;
    background: #fff;
    color: #111;
    border: 3px solid #111;
    max-width: 340px;
    padding: 6px 8px 4px;
    user-select: none;
    box-shadow: 4px 4px 0 #111;
  }

  /* ── Header ───────────────────────────────────── */
  .header {
    border-bottom: 10px solid #111;
    padding-bottom: 4px;
    margin-bottom: 2px;
  }

  .title {
    font-size: 2.6rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.5px;
  }

  .serving-info {
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .serving-size-row {
    display: flex;
    justify-content: space-between;
    font-size: 1rem;
    font-weight: 700;
  }

  /* ── Calories ─────────────────────────────────── */
  .calories-block {
    border-bottom: 5px solid #111;
    padding: 3px 0 4px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .nutrient-button {
    width: 100%;
    background: transparent;
    color: inherit;
    text-align: inherit;
  }

  .nutrient-button.clickable {
    cursor: pointer;
  }

  .nutrient-button:focus-visible {
    outline: 2px solid #ea580c;
    outline-offset: 2px;
  }

  .calories-header {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .amt-per {
    font-size: 0.72rem;
    font-weight: 600;
    font-family: "Barlow", sans-serif;
  }

  .calories-word {
    font-size: 1.6rem;
    font-weight: 800;
  }

  .calories-num {
    font-size: 3.2rem;
    font-weight: 900;
    line-height: 1;
  }

  /* ── DV header ────────────────────────────────── */
  .dv-header {
    text-align: right;
    font-size: 0.72rem;
    font-weight: 700;
    font-family: "Barlow", sans-serif;
    border-bottom: 1px solid #111;
    padding: 2px 0;
    margin-bottom: 0;
  }

  /* ── Nutrient rows ────────────────────────────── */
  .nutrient-row {
    position: relative;
    border-bottom: 1px solid #ddd;
    overflow: hidden;
    min-height: 26px;
  }

  .nutrient-row.thick-border {
    border-bottom: 5px solid #111;
  }

  .nutrient-row.no-border {
    border-bottom: none;
  }

  /* The progress bar fills from left */
  .bar-bg {
    position: absolute;
    inset: 0;
    width: var(--bar-pct);
    background: var(--bar-color);
    opacity: 0.18;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .row-content {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 2px 3px 4px;
  }

  .nutrient-row.indent .row-content {
    padding-left: 18px;
  }

  .nutrient-row.sub .row-content {
    padding-left: 32px;
  }

  .nutrient-name {
    font-size: 0.9rem;
    font-weight: 600;
    font-family: "Barlow", sans-serif;
  }

  .nutrient-name.bold {
    font-weight: 800;
    font-family: "Barlow Condensed", sans-serif;
    font-size: 1rem;
  }

  .amount {
    font-weight: 700;
  }

  .dv-text {
    font-size: 0.78rem;
    font-weight: 700;
    font-family: "Barlow Condensed", sans-serif;
    white-space: nowrap;
    color: #222;
  }

  /* ── Micronutrients ───────────────────────────── */
  .thick-divider {
    border-bottom: 8px solid #111;
  }

  .nutrient-row.micro .nutrient-name {
    font-weight: 700;
    font-family: "Barlow Condensed", sans-serif;
    font-size: 0.95rem;
  }

  /* ── Footnote ─────────────────────────────────── */
  .footnote {
    font-family: "Barlow", sans-serif;
    font-size: 0.62rem;
    line-height: 1.3;
    border-top: 3px solid #111;
    margin-top: 4px;
    padding-top: 4px;
    color: #333;
  }
</style>
