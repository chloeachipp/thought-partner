# Thought Partner

Thought Partner is a spatial AI thinking interface built with Next.js, TypeScript, and a custom visual system. It turns a seed idea into a navigable thought graph with related ideas, tensions, and perspective shifts.

## Environment Setup

Create a `.env.local` file in the project root.

You can configure either OpenAI or Anthropic (only one provider is required).

```bash
# Provider selection: "openai" or "anthropic"
AI_PROVIDER=openai

# OpenAI option
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini

# Anthropic option
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

Notes:
- You only need one provider configured at a time.
- If no provider is configured, the app automatically uses local mock fallback data so the prototype remains fully interactive.

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Architecture (Brief)

- Client: `components/ThoughtCanvas.tsx` handles interactions, panning/focus, generation states, and graph updates.
- API route: `app/api/thought/route.ts` validates requests, orchestrates generation modes, and returns typed JSON.
- Provider layer: `lib/ai/provider-config.ts` selects OpenAI or Anthropic from environment configuration.
- Structured output: Zod schemas enforce predictable response shape for initial and interaction modes.
- Graph rendering: `lib/graph/graph-layout.ts` + `components/ConnectionsSVG.tsx` place nodes/edges and render a readable spatial canvas.
