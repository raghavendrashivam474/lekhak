# Lekhak

> **The Memory Layer for Writers.**

A memory-first writing workspace that preserves not only what writers create, but also **why they created it, how ideas connect, how projects evolve, and where work should continue.**

**Status:** Active Development
**Version:** **v0.11 — Temporal Memory Layer v1**
**License:** MIT

---

# About

Lekhak was created by **Raghavendra Singh** around a simple problem:

> Writers rarely lose words.
>
> They lose context.

Creative work usually survives.

The thinking behind it does not.

After weeks or months away from a project, writers often struggle to remember:

* Why they started
* What they were trying to achieve
* Which ideas mattered
* How ideas connected
* What changed
* Where they should continue

Lekhak is being built as a **creative memory system** that preserves this missing context.

---

# Vision

Most writing software stores documents.

Lekhak preserves understanding.

It gradually builds a living memory of:

* Projects
* Notes
* Activity
* Intent
* Relationships
* Knowledge
* Insights
* Creative context
* Project evolution

The goal is simple:

> Help writers reconnect with their work, whether they return after one day or one year.

---

# Product Evolution

Lekhak is intentionally developed in layers.

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
Creative Operating System
```

Each layer builds upon the previous one.

Nothing is replaced.

Everything evolves.

---

# Current Capabilities

## Writing Workflow

* Projects
* Notes
* Project Organization
* Project Dashboard
* Secure Authentication
* Server-Side Sessions
* Row-Level Security

---

## Memory Layer

Preserves what happened.

* Activity Timeline
* Recent Activity
* Last Active Tracking
* Resume Context
* Project History

---

## Intent Layer

Preserves why work exists.

Every project can maintain:

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions

---

## Relationship Layer

Connects creative memory.

Capabilities include:

* Related Notes
* Note References
* Question Relationships
* Goal Support
* Focus Support
* Next Step Dependencies
* Intent Links

---

## Knowledge Layer

Organizes connected information.

Capabilities include:

* Collections
* Knowledge Spaces
* Knowledge Tags
* Smart References
* Project Health
* Resume Workspace

---

## Writer Intelligence

Derives meaningful project signals.

Capabilities include:

* Writing Momentum
* Goal Progress
* Focus Drift Detection
* Question Intelligence
* Creative Gap Analysis
* Project Health Insights
* Weekly Summary
* Smart Resume

Writer Intelligence is deterministic.

It does not write for the writer.

It helps the writer understand their own work.

---

# Memory Graph

The Memory Graph makes accumulated creative memory visible.

It projects:

* Projects
* Collections
* Notes
* Questions
* Knowledge Tags

into an interactive relationship graph.

```text
Creative Memory
↓
Graph Projection
↓
Relationships Become Visible
↓
Context Can Be Explored
```

Writers can explore memory through contextual entry points, inspect entities, search projected memory, filter relationships, and preserve an exploration trail.

The graph is a **projection of existing project memory**.

It is not a separate source of truth.

---

# Spatial Memory

Spatial Memory introduces a contextual lens over creative memory.

```text
Graph
→ How is memory connected?

Space
→ What matters in this context?
```

Spatial meaning follows four principles:

```text
Distance   = Contextual Relevance
Depth      = Contextual Priority
Prominence = Attention Priority
Region     = Memory Role
```

Memory is organized into semantic regions:

* Current Work
* Open Threads
* Established Knowledge
* Peripheral Memory

Selecting a memory recomposes the surrounding context.

Relevant ideas move closer.

Supporting context remains visible.

Peripheral memory becomes secondary.

The renderer displays meaning.

The domain derives meaning.

---

# Temporal Memory Layer v1

Temporal Memory allows Lekhak to understand **how a project became its current state**.

Before Temporal Memory, Lekhak could answer:

> What does this project look like now?

It can now begin answering:

> How did this project become what it is?

Temporal Memory preserves meaningful state transitions such as:

* Goal Changes
* Focus Changes
* Next Step Changes
* Questions Raised
* Question Resolution
* Question Reopening
* Relationship Creation
* Relationship Removal
* Intent Link Evolution

Operational activity and temporal evolution remain separate.

```text
Activity
→ What action happened?

Temporal Memory
→ How did project state change?
```

---

## Project Evolution

Lekhak can derive a meaningful project evolution timeline from temporal evidence.

It can identify:

* Direction Changes
* Focus Shifts
* Major Question Resolutions
* Knowledge Breakthroughs
* Project Resumption
* Creative Phase Transitions

These moments are derived deterministically.

No generative AI is required.

---

## Project Phases

Lekhak can derive creative project phases from observable project signals.

Current phases include:

```text
Exploring
Structuring
Active
Revising
Dormant
Resumed
```

Phase resolution considers project activity, writing momentum, intent, questions, notes, collections, and temporal evidence.

---

## Historical Reconstruction

Lekhak can reconstruct meaningful project state at a past reference time.

Currently reconstructed:

* Project Goal
* Current Focus
* Next Writing Step
* Question Lifecycle
* Question Status
* Relationship Existence
* Project Phase

This allows writers to explore questions such as:

> What was my focus three weeks ago?

> When did this goal change?

> How long was this question unresolved?

> When did these ideas become connected?

Historical state is read-only.

---

## Historical Memory Exploration

Historical project state can be projected through the existing Memory Graph and Spatial Memory systems.

```text
Reference Time
↓
Temporal Snapshot
↓
Historical Memory State
↓
Graph Projection
↓
Spatial Projection
↓
Existing Renderers
```

The renderers remain time-agnostic.

Time changes state.

State changes the projection.

The visualization naturally reflects the historical memory.

---

# Architecture

Lekhak follows a layered architecture.

```text
UI
↓
Components
↓
Graph / Spatial Renderers
↓
Renderer Adapters
↓
Spatial Projection
↓
Graph Projection
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

The architecture follows a simple principle:

> **The domain derives meaning. The renderer displays meaning.**

---

# Technology Stack

## Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

## Memory Graph

* `@xyflow/react`
* Renderer-Independent Graph Projection

## Spatial Memory

* Three.js
* React Three Fiber
* Drei
* Renderer-Independent Spatial Projection

## Backend

* Supabase
* PostgreSQL

## Authentication

* Supabase Auth
* `@supabase/ssr`

## Validation

* Zod
* React Hook Form

---

# Local Development

## Prerequisites

* Node.js 20+
* npm
* Supabase Project

Clone the repository:

```bash
git clone https://github.com/raghavendrashivam474/lekhak.git
```

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Start development:

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

v0.11


Current Milestone

Temporal Memory Layer v1


Development Status

Active Development
```

Lekhak currently:

```text
Stores what exists
↓
Remembers what happened
↓
Preserves why work exists
↓
Connects related ideas
↓
Organizes creative knowledge
↓
Interprets writing patterns
↓
Visualizes accumulated memory
↓
Projects memory into semantic space
↓
Preserves how creative state evolves
```

---

# Roadmap

## Completed

* ✅ Foundation
* ✅ Authentication
* ✅ Writing Workflow
* ✅ Memory Layer
* ✅ Intent Layer
* ✅ Relationship Layer
* ✅ Knowledge Layer
* ✅ Writer Intelligence
* ✅ Memory Graph v1
* ✅ Spatial Memory Foundation v1
* ✅ Temporal Memory Layer v1

---

## Next

The next stage will build upon the temporal foundation to deepen Lekhak's understanding of **creative continuity and long-term project memory**.

The central question becomes:

> Can Lekhak help a writer understand not only their past and present creative state, but the direction their work is moving?

---

# Documentation

Project documentation is available in the `docs/` directory.

* `PRODUCT_VISION.md`
* `ROADMAP.md`
* `ARCHITECTURE.md`
* `DESIGN_PHILOSOPHY.md`
* `3D_PHILOSOPHY.md`
* `HANDOVER.md`
* `CONTRIBUTING.md`
* `CHANGELOG.md`
* `CODE_OF_CONDUCT.md`
* `SECURITY.md`

---

# Founder

**Raghavendra Singh**

Engineering Student, Builder, and Creator.

Lekhak began from a simple realization:

> Writers rarely lose their work.
>
> They lose the thinking behind it.

This project is an attempt to preserve that thinking and help writers reconnect with their creative journeys.

---

# Long-Term Mission

Lekhak is not being built as another note-taking application.

It is being built as a system that remembers creative journeys.

A place where writers can return months—or years—later and understand:

> What was I building?

> Why was I building it?

> How do these ideas connect?

> What changed?

> How did my thinking evolve?

> Where should I continue?

Creative work should not only be stored.

It should be remembered.

Connected.

Understood.

And navigable.

---

# Motto

> **The Memory Layer for Writers.**

---

# License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.
