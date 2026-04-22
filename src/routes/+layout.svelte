<script lang="ts">
  import "./layout.css"
  import favicon from "$lib/assets/favicon.svg"
  import { page } from "$app/state"

  let { children } = $props()

  const nav = [
    { href: "/", label: "Today", icon: "◉" },
    { href: "/scan", label: "Scan", icon: "⊙" },
    { href: "/settings", label: "Settings", icon: "⚙" },
  ]
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="mx-auto flex h-dvh max-w-lg flex-col bg-zinc-950">
  <main class="min-h-0 flex-1 overflow-y-auto">
    {@render children()}
  </main>

  <nav
    class="shrink-0 border-t border-zinc-800/60 bg-zinc-950"
    style="font-family: 'DM Mono', monospace;"
  >
    <div class="flex">
      {#each nav as item}
        <a
          href={item.href}
          class="flex flex-1 flex-col items-center gap-1 py-3 text-xs tracking-[0.15em] uppercase transition-colors {page
            .url.pathname === item.href
            ? 'text-white'
            : 'text-zinc-600 hover:text-zinc-400'}"
        >
          <span class="text-base leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      {/each}
    </div>
  </nav>
</div>
