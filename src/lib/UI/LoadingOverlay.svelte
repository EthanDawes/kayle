<script lang="ts">
  interface Props {
    message?: string
  }
  let { message = "Processing..." }: Props = $props()
</script>

<div
  class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-zinc-950/90 backdrop-blur-sm"
  style="font-family: 'DM Mono', monospace;"
>
  <div class="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/80"></div>
  <p class="text-xs tracking-[0.2em] text-zinc-400 uppercase">{message}</p>
</div>
