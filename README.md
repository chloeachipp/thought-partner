# Thought Partner

Thought Partner is a small ecosystem of AI-native creative tools designed for early-stage ideation. It is built for moments when direction is still forming: before the brief is fixed, before the script is locked, before the concept is obvious.

Rather than behaving like a single chat window, the app offers purpose-built interfaces for different creative tasks.

## Product Overview

The product currently includes two complementary tools:

1. Creative Direction Engine
2. SceneWeaver

Together they support concept exploration at two levels:

- system-level thinking (ideas, tensions, perspectives)
- scene-level interpretation (emotion, visual language, cinematic direction)

## Creative Direction Engine

Creative Direction Engine is a spatial thinking interface.

You start with a seed thought and the system expands it into a navigable graph of adjacent ideas, framing shifts, and productive tensions. The focus is not on answering a question once; it is on helping a user see a concept from multiple angles quickly and intentionally.

## SceneWeaver

SceneWeaver is a cinematic interpretation tool.

A user describes a scene in plain language, and SceneWeaver returns structured creative direction across emotional arc, visual language, camera direction, lighting and colour, sound texture, pacing, motifs, alternates, and adaptation modes. It supports refinement loops and comparison between versions to make taste-level iteration faster.

## Target Users

- Creative directors shaping early narrative territory
- Filmmakers developing scene intent before scripting or shotlisting
- Brand and campaign teams exploring tonal directions
- Writers and visual storytellers pressure-testing creative choices

## Why This Is Different From a Generic Chatbot

Generic chat interfaces optimize for conversational breadth.

Thought Partner optimizes for creative structure:

- task-specific interaction models instead of one universal prompt box
- typed, predictable outputs designed for downstream use
- visual and editorial presentation tuned to decision-making, not chat history
- iterative flows (refine, compare, branch) that preserve creative context

## Design Principles

- Interface follows creative intent: each tool has a distinct interaction grammar
- Output should feel editorial, not transactional
- Ambiguity is supported, but structure is never lost
- Motion and atmosphere should guide focus, not distract
- The system should invite iteration, not force finality

## Technical Architecture (High-Level)

- Next.js App Router application with tool-specific routes and shared foundations
- React + TypeScript for strongly typed UI/state orchestration
- API routes per tool for server-side prompt handling and response shaping
- Zod schemas for validation and structured AI outputs
- Shared provider abstraction for model selection and environment configuration
- Custom cinematic/spatial UI system for differentiated interaction modes

## OpenAI / Anthropic Integration

Both tools run through a shared provider layer that can target OpenAI or Anthropic.

- model provider is selected at runtime
- request/response contracts are normalized through schema validation
- fallback and mock pathways are available for local development and resilience

This keeps model choice flexible while preserving consistent product behavior.

## Future Expansion Opportunities

- Additional specialized tools (tone mapper, concept-to-treatment, visual motif explorer)
- Cross-tool handoff flows (graph insight -> scene direction -> exportable brief)
- Team features (shared sessions, annotations, version lineage)
- Rich export surfaces (PDF decks, production-ready direction docs, prompt packages)
- Deeper memory and project context across sessions

## Positioning

Thought Partner is not an AI assistant with creative features bolted on.

It is a design-led creative operating layer: a focused set of AI-native tools for shaping ideas before they become production artifacts.
