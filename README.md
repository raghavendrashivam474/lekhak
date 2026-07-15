# Lekhak

> **The Memory Layer for Writers.**

A memory-first writing workspace that helps writers preserve not only what they create, but also **why they created it, how their ideas connect, how their projects evolve, what those projects mean, and where they should continue next.**

**Status:** Active Development  
**Version:** **v0.12 — Creative Reasoning Layer v1**  
**License:** MIT

---

# About

Lekhak was created by **Raghavendra Singh** around a simple realization:

> Writers rarely lose words.
>
> They lose context.

Creative work usually survives.

The thinking behind it does not.

After weeks—or even months—away from a project, writers often struggle to remember:

- Why they started
- What they were trying to achieve
- Which ideas mattered
- How everything connected
- What changed
- What is blocking progress
- Where they should continue

Lekhak exists to preserve that missing context.

Rather than becoming another writing editor, it is being built as a **creative memory and reasoning system** that grows alongside every writing project.

---

# Vision

Most writing software stores documents.

Lekhak preserves understanding.

As writers continue working, Lekhak gradually builds a living model of:

- Projects
- Notes
- Activity
- Intent
- Relationships
- Knowledge
- Insights
- Spatial Context
- Temporal Evolution
- Creative Reasoning

The long-term goal is simple:

> Help writers reconnect with their work instantly, whether they return after one day or one year.

---

# Product Evolution

Lekhak has been intentionally developed in layers.

Each layer deepens the application's understanding of creative work.

```text
Foundation
        ↓
Authentication
        ↓
Writing Workflow
        ↓
Memory
        ↓
Intent
        ↓
Relationships
        ↓
Knowledge
        ↓
Writer Intelligence
        ↓
Memory Graph
        ↓
Spatial Memory
        ↓
Temporal Memory
        ↓
Creative Reasoning
        ↓
Creative Operating System
```

Nothing is replaced.

Each layer builds upon everything before it.

---

# Current Capabilities

## Writing Workflow

Core writing experience.

Features include:

- Projects
- Notes
- Project Organization
- Project Dashboard
- Secure Authentication
- Server-Side Sessions
- Row-Level Security

---

## Memory Layer

Preserves what happened.

Features include:

- Activity Timeline
- Recent Activity
- Resume Context
- Last Active Tracking
- Project History

---

## Intent Layer

Preserves why work exists.

Every project maintains:

- Project Goal
- Current Focus
- Next Writing Step
- Open Questions

---

## Relationship Layer

Connects creative memory.

Capabilities include:

- Related Notes
- Note References
- Intent Links
- Question Relationships
- Goal Support
- Focus Support
- Next Step Dependencies

Ideas become connected instead of isolated.

---

## Knowledge Layer

Organizes connected information.

Capabilities include:

- Collections
- Knowledge Spaces
- Knowledge Tags
- Smart References
- Resume Workspace
- Project Health

Projects become organized knowledge workspaces rather than simple collections of notes.

---

## Writer Intelligence

Derives meaningful writing insights.

Capabilities include:

- Writing Momentum
- Goal Progress
- Focus Drift Detection
- Creative Gap Analysis
- Question Intelligence
- Smart Resume
- Weekly Summary
- Project Health Insights

Writer Intelligence is deterministic.

It helps writers understand their work without generating it.

---

# Memory Graph

The Memory Graph transforms accumulated creative memory into an interactive knowledge graph.

It projects:

- Projects
- Notes
- Collections
- Questions
- Knowledge Tags

into an explorable relationship network.

```text
Creative Memory
        ↓
Graph Projection
        ↓
Interactive Exploration
```

The graph is a projection of project memory.

It is never a separate source of truth.

---

# Spatial Memory

Spatial Memory introduces semantic navigation.

Instead of asking only:

```text
How are ideas connected?
```

it also answers:

```text
What matters most right now?
```

Spatial meaning follows four principles:

```text
Distance
    = Contextual Relevance

Depth
    = Importance

Prominence
    = Attention Priority

Region
    = Memory Role
```

Memory is organized into semantic regions such as:

- Current Work
- Open Threads
- Established Knowledge
- Peripheral Memory

The renderer displays meaning.

The domain derives meaning.

---

# Temporal Memory

Temporal Memory preserves how projects evolve.

Instead of only understanding the current project,

Lekhak can reconstruct how the project reached its present state.

It records meaningful changes including:

- Goal Evolution
- Focus Changes
- Next Step History
- Question Lifecycle
- Relationship Evolution
- Intent Link Changes
- Creative Phase Changes

Temporal Memory answers questions like:

> When did this goal change?

> How long was this question unresolved?

> When did these ideas become connected?

Historical reconstruction remains deterministic and read-only.

---

# Creative Reasoning Layer

Creative Reasoning is the newest layer in Lekhak.

It transforms accumulated creative memory into meaningful understanding.

Instead of asking:

> What exists?

the application now begins asking:

> What does this project mean?

Creative Reasoning derives understanding from every previous layer.

---

## Creative Threads

The application no longer thinks in isolated notes.

Instead, it discovers coherent creative threads by grouping related ideas into meaningful units of work.

Each thread represents a connected creative concept rather than an individual document.

---

## Narrative Progress

Every thread receives measurable progress based on:

- Intent
- Questions
- Relationships
- Knowledge
- Supporting Notes

Progress is derived from project structure rather than manually entered percentages.

---

## Creative Dependencies

The system understands what depends on what.

Examples include:

```text
Question
        ↓
Goal
        ↓
Current Focus
        ↓
Next Writing Step
        ↓
Creative Thread
```

This allows Lekhak to explain why progress has stopped.

---

## Creative Health

Creative Health evaluates the current state of a project using measurable signals such as:

- Intent Clarity
- Thread Coverage
- Question Resolution
- Dependency Health
- Writing Momentum
- Narrative Progress

Every score includes supporting evidence.

---

## Creative Insights

Creative Reasoning derives deterministic insights including:

- Continue Here
- Blocking Issues
- Attention Areas
- Thread Progress
- Creative Health
- Project Summary

Every insight is backed by evidence.

Nothing is generated through AI.

---

## Temporal Explanations

Reasoning now combines with Temporal Memory.

Instead of only showing history,

Lekhak explains it.

Examples include:

- Goal Evolution
- Focus Evolution
- Thread Evolution
- Question Lifecycle

Every explanation references real project history.

---

## Reasoning Dashboard

Projects now expose a reasoning workspace containing:

- Continue Here
- Creative Health
- Blocking Issues
- Attention Areas
- Thread Progress
- Project Summary

The dashboard explains projects instead of merely reporting statistics.

---

# Architecture

Lekhak follows a layered architecture.

```text
UI
        ↓
Reasoning Dashboard
        ↓
Graph & Spatial Renderers
        ↓
Renderer Adapters
        ↓
Creative Reasoning
        ↓
Temporal Memory
        ↓
Writer Intelligence
        ↓
Knowledge
        ↓
Relationships
        ↓
Intent
        ↓
Memory
        ↓
Service Layer
        ↓
Supabase
        ↓
PostgreSQL
```

Architecture follows one simple principle:

> **The domain derives meaning. The UI presents meaning.**

---

# Technology Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Graph Visualization

- @xyflow/react

## Spatial Visualization

- Three.js
- React Three Fiber
- Drei

## Backend

- Supabase
- PostgreSQL

## Authentication

- Supabase Auth
- @supabase/ssr

## Validation

- Zod
- React Hook Form

---

# Local Development

## Prerequisites

- Node.js 20+
- npm
- Supabase Project

Clone the repository:

```bash
git clone https://github.com/raghavendrashivam474/lekhak.git
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Configure:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Current Status

```text
Version
v0.12

Current Milestone
Creative Reasoning Layer v1

Development Status
Active Development
```

Lekhak currently:

```text
Stores creative work
        ↓
Remembers activity
        ↓
Preserves intent
        ↓
Connects ideas
        ↓
Organizes knowledge
        ↓
Derives writing insights
        ↓
Visualizes memory
        ↓
Navigates semantic space
        ↓
Reconstructs project history
        ↓
Explains creative state
```

---

# Roadmap

## Completed

- ✅ Foundation
- ✅ Authentication
- ✅ Writing Workflow
- ✅ Memory Layer
- ✅ Intent Layer
- ✅ Relationship Layer
- ✅ Knowledge Layer
- ✅ Writer Intelligence
- ✅ Memory Graph
- ✅ Spatial Memory
- ✅ Temporal Memory
- ✅ Creative Reasoning

---

## Next

The next evolution is **Creative Guidance**.

The guiding question becomes:

> Can Lekhak not only understand a creative project, but also help the writer decide what to do next?

---

# Documentation

Documentation is available inside the `docs/` directory.

- PRODUCT_VISION.md
- ROADMAP.md
- ARCHITECTURE.md
- DESIGN_PHILOSOPHY.md
- 3D_PHILOSOPHY.md
- HANDOVER.md
- CONTRIBUTING.md
- CHANGELOG.md
- CODE_OF_CONDUCT.md
- SECURITY.md

---

# Founder

**Raghavendra Singh**

Engineering Student, Builder, and Creator.

Lekhak began from a simple realization:

> Writers rarely lose their work.

> They lose the thinking behind it.

This project is an attempt to preserve that thinking and help writers reconnect with their creative journeys.

---

# Long-Term Mission

Lekhak is not being built as another note-taking application.

It is being built as a **Creative Operating System**.

A place where writers can return months—or years—later and immediately understand:

> What was I building?

> Why was I building it?

> How do these ideas connect?

> What changed?

> What is blocking progress?

> Where should I continue?

Creative work should not only be stored.

It should be remembered.

Connected.

Explained.

And ultimately understood.

---

# Motto

> **The Memory Layer for Writers.**

---

# License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.