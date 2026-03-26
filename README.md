# Thought Partner

Thought Partner is a spatial AI thinking interface built with Next.js, TypeScript, and a custom visual system. It turns a seed idea into a navigable thought graph with related ideas, tensions, and perspective shifts.

## Architecture (Brief)

- Client: `components/ThoughtCanvas.tsx` handles interactions, panning/focus, generation states, and graph updates.
- API route: `app/api/thought/route.ts` validates requests, orchestrates generation modes, and returns typed JSON.
- Provider layer: `lib/ai/provider-config.ts` selects OpenAI or Anthropic from environment configuration.
- Structured output: Zod schemas enforce predictable response shape for initial and interaction modes.
- Graph rendering: `lib/graph/graph-layout.ts` + `components/ConnectionsSVG.tsx` place nodes/edges and render a readable spatial canvas.
