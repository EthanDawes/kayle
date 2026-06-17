<script lang="ts">
  import { settings } from "$lib/stores/settings.svelte"

  let openaiKey = $state(settings.openaiKey)
  let offKey = $state(settings.openfoodfactsKey)
  let showOpenai = $state(false)
  let showOff = $state(false)
  let saved = $state(false)

  function save() {
    settings.setOpenaiKey(openaiKey)
    settings.setOpenfoodfactsKey(offKey)
    saved = true
    setTimeout(() => (saved = false), 2000)
  }

  function clear() {
    openaiKey = ""
    offKey = ""
    settings.setOpenaiKey("")
    settings.setOpenfoodfactsKey("")
  }
</script>

<svelte:head>
  <title>Kayle Settings</title>
</svelte:head>

<div class="flex flex-col gap-6 p-5" style="font-family: 'DM Mono', monospace;">
  <div class="pt-2">
    <p class="text-xs tracking-[0.2em] text-zinc-500 uppercase">Configuration</p>
    <h1 class="text-2xl font-bold text-white">Settings</h1>
  </div>

  <div class="flex flex-col gap-5 rounded-2xl border border-zinc-900 p-5">
    <!-- OpenAI key -->
    <div class="flex flex-col gap-2">
      <label class="text-xs tracking-[0.2em] text-zinc-400 uppercase" for="openai-key">
        OpenAI API Key
      </label>
      <p class="text-xs text-zinc-600">Required for food photo analysis (GPT-4o Vision).</p>
      <div class="relative">
        <input
          id="openai-key"
          type={showOpenai ? "text" : "password"}
          bind:value={openaiKey}
          placeholder="sk-..."
          class="w-full rounded-xl px-4 py-3 pr-12 text-sm placeholder-zinc-600 ring-1 ring-zinc-700 outline-none focus:ring-white/30"
        />
        <button
          onclick={() => (showOpenai = !showOpenai)}
          class="absolute top-1/2 right-3 -translate-y-1/2 text-lg text-zinc-500 transition-colors hover:text-zinc-300"
          aria-label="Toggle OpenAI key visibility"
          type="button"
        >
          {showOpenai ? "🙈" : "👁️"}
        </button>
      </div>
    </div>

    <!-- OpenFoodFacts key -->
    <div class="flex flex-col gap-2">
      <label class="text-xs tracking-[0.2em] text-zinc-400 uppercase" for="off-key">
        Open Food Facts API Key
      </label>
      <p class="text-xs text-zinc-600">
        Optional — enables higher rate limits for barcode scanning.
      </p>
      <div class="relative">
        <input
          id="off-key"
          type={showOff ? "text" : "password"}
          bind:value={offKey}
          placeholder="optional"
          class="w-full rounded-xl px-4 py-3 pr-12 text-sm placeholder-zinc-600 ring-1 ring-zinc-700 outline-none focus:ring-white/30"
        />
        <button
          onclick={() => (showOff = !showOff)}
          class="absolute top-1/2 right-3 -translate-y-1/2 text-lg text-zinc-500 transition-colors hover:text-zinc-300"
          aria-label="Toggle OpenFoodFacts key visibility"
          type="button"
        >
          {showOff ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  </div>

  <!-- Info box -->
  <div class="rounded-xl border border-zinc-800 p-4">
    <p class="text-xs leading-relaxed text-zinc-600">
      Keys are stored only in your browser's localStorage. They are sent directly to OpenAI and Open
      Food Facts and never routed through any other server.
    </p>
  </div>

  <!-- Actions -->
  <div class="flex gap-3">
    <button
      onclick={clear}
      class="flex-1 rounded-full border border-zinc-700 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
      type="button"
    >
      Clear All
    </button>
    <button
      onclick={save}
      class="flex-1 rounded-full py-3 text-sm font-semibold transition-all"
      class:bg-green-500={saved}
      class:text-white={saved}
      class:bg-white={!saved}
      class:text-zinc-900={!saved}
      class:hover:opacity-90={!saved}
      type="button"
    >
      {saved ? "✓ Saved" : "Save"}
    </button>
  </div>
</div>
