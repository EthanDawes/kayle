<script lang="ts">
  import "./layout.css"
  import favicon from "$lib/assets/favicon.svg"
  import { page } from "$app/state"
  import { resolve } from "$app/paths"
  import { pwaInfo } from "virtual:pwa-info"
  import { pwaAssetsHead } from "virtual:pwa-assets/head"
  import { onMount } from "svelte"

  const nav = [
    { href: "/", label: "Today", icon: "◉" },
    { href: "/trends", label: "Trends", icon: "📈" },
    { href: "/scan", label: "Scan", icon: "⊙" },
    { href: "/settings", label: "Settings", icon: "⚙" },
  ] as const

  // Adapted from https://vite-pwa-org.netlify.app/frameworks/sveltekit.html
  onMount(async () => {
    if (pwaInfo) {
      const { registerSW } = await import("virtual:pwa-register")
      registerSW({
        immediate: true,
        onRegistered(r: ServiceWorkerRegistration) {
          // uncomment following code if you want check for updates
          // r && setInterval(() => {
          //    console.log('Checking for sw update')
          //    r.update()
          // }, 20000 /* 20s for testing purposes */)
          console.log("SW Registered:", r)
        },
        onRegisterError(error: any) {
          console.log("SW registration error", error)
        },
      })
    }
  })

  let { children } = $props()

  // Adapted from https://github.com/vite-pwa/sveltekit/tree/de3bd8e20458e77409c0786996a2defd82e39530/examples/sveltekit-ts-assets-generator
  // Couldn't automaticly generate icons, so must manually
  const webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : "")
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap"
    rel="stylesheet"
  />
  {#if pwaAssetsHead.themeColor}
    <meta name="theme-color" content={pwaAssetsHead.themeColor.content} />
  {/if}
  {#each pwaAssetsHead.links as link}
    <link {...link} />
  {/each}

  {@html webManifest}
</svelte:head>

<div class="mx-auto flex h-dvh max-w-lg flex-col">
  <main class="min-h-0 flex-1 overflow-y-auto">
    {@render children()}
  </main>

  <nav class="shrink-0 border-t" style="font-family: 'DM Mono', monospace;">
    <div class="flex">
      {#each nav as item}
        <a
          href={resolve(item.href)}
          class="flex flex-1 flex-col items-center gap-1 py-3 text-xs tracking-[0.15em] uppercase transition-colors {page
            .url.pathname === item.href
            ? 'text-black'
            : 'text-zinc-600 hover:text-zinc-400'}"
        >
          <span class="text-base leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      {/each}
    </div>
  </nav>
</div>
