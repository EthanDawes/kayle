<script lang="ts">
  import Spinner from "./components/Spinner.svelte"

  interface Props {
    message?: string
  }
  let { message = "Processing..." }: Props = $props()
</script>

<div
  class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-zinc-950/90 backdrop-blur-sm"
  style="font-family: 'DM Mono', monospace;"
>
  <Spinner />
  <p class="text-xs tracking-[0.2em] text-zinc-400 uppercase">{message}</p>
</div>
