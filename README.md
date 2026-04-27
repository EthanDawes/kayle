# Kayle

**Wholistic AI meal tracking** — deployed at [ethandawes.github.io/kayle](https://ethandawes.github.io/kayle/)

Most nutrition apps only track macros (protein, carbs, calories). Kayle tracks *everything* and presents it as a familiar nutrition label, so you always know exactly what you're eating without having to learn a new format.

## Features

- **Purdue Dining menus** — browse and log meals directly from Purdue's dining halls via the Purdue HFS GraphQL API
- **LLM vision** — photograph any meal and let an AI identify it and estimate its full nutritional content
- **Barcode scanning** — scan packaged food barcodes to pull nutrition data instantly
- **Full nutrition labels** — output matches the FDA nutrition-facts format that people already know how to read, covering far more than just macros
- **Progressive Web App** — installable on mobile for quick logging on the go

## Developing

Install dependencies and start the dev server:

```sh
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The app hot-reloads as you edit files.

### Useful scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start local dev server |
| `pnpm build` | Production build (output in `build/`) |
| `pnpm preview` | Preview the production build locally |
| `pnpm check` | Run Svelte + TypeScript type checking |
| `pnpm format` | Format code with Prettier |
| `pnpm codegen` | Regenerate GraphQL types from the Purdue HFS schema |
| `pnpm dev:server` | Run the Cloudflare Workers backend locally with Wrangler |

### Stack

- [SvelteKit](https://kit.svelte.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/) (backend / AI proxy)
- [OpenAI](https://platform.openai.com/) (vision)
- [Dexie](https://dexie.org/) (IndexedDB wrapper for local storage)
- [Chart.js](https://www.chartjs.org/) (nutrition trend charts)
