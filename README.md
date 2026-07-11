# Lekhak

> **The Memory Layer for Writers.**

A memory-first writing workspace that helps writers preserve not only what they write, but also **why they wrote it, how their ideas connect, what deserves attention, and where they should continue.**

**Status:** Active Development
**Version:** **v0.9 — Memory Graph v1**
**License:** MIT

---

# About

Lekhak was created by **Raghavendra Singh** to solve a problem experienced by nearly every writer.

> Writers rarely lose words.
>
> They lose context.

Creative work rarely disappears.

What disappears is the thinking behind it.

Weeks or months later, writers often return to a project and struggle to remember:

* Why they started
* What they were trying to achieve
* Which ideas mattered
* How everything connected
* What changed
* Where they should continue

Lekhak exists to preserve that missing context.

Rather than becoming another writing editor, Lekhak is being built as a **creative memory system** that grows alongside every project.

---

# Vision

Most writing software stores documents.

Lekhak preserves understanding.

Instead of simply organizing notes, Lekhak gradually builds a living memory of a writer's creative journey.

It remembers:

* Projects
* Notes
* Activity
* Intent
* Relationships
* Knowledge
* Insights
* Creative connections
* Exploration context

The long-term goal is to help writers reconnect with their work instantly, whether they return after one day or one year.

---

# Product Identity

Traditional writing software focuses on documents.

Knowledge management software focuses on information.

Lekhak focuses on **creative memory**.

Its objective is to help writers remember:

* What they created
* Why they created it
* How it evolved
* Which ideas connect together
* What deserves attention
* Where they should continue

Every capability in Lekhak exists to strengthen one or more of these principles.

---

# Core Philosophy

> Remember every story.
>
> Remember every idea.
>
> Remember why you started.

Writing is more than producing words.

It is the accumulation of ideas, decisions, revisions, questions, relationships, and experiences.

Lekhak is designed to preserve that entire creative journey.

---

# Why Lekhak?

Modern writing workflows are fragmented.

Creative work is often spread across multiple tools.

```text
Google Docs
Notion
Research PDFs
Voice Notes
Bookmarks
Screenshots
Random Notes
Ideas on Paper
```

Eventually, projects become difficult to resume.

Most writing tools answer:

> "What documents do you have?"

Lekhak answers:

> "What were you building?"

And increasingly:

> "How does everything you built connect?"

---

# The Solution

Lekhak gradually builds an understanding of every writing project.

Instead of only storing content, it preserves and derives:

* What changed
* Why the project exists
* What the writer is focused on
* Which ideas relate
* Which concepts belong together
* Which projects require attention
* Where unresolved questions remain
* How the writer can continue immediately

Every writing session strengthens the application's understanding of the project.

The accumulated memory can then be explored through contextual and visual representations.

---

# Product Evolution

Lekhak has been intentionally developed in layers.

Each layer solves a deeper creative problem.

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

Visual Memory Graph

↓

Spatial Memory

↓

Creative Operating System
```

Each layer builds upon the previous one.

Nothing is replaced.

Everything evolves.

---

# Current Capabilities

## Authentication

Secure authentication powered by Supabase.

Features:

* User Registration
* User Login
* User Logout
* Protected Routes
* Server-Side Authentication
* Cookie-Based Sessions
* Row-Level Security

---

## Writing Workflow

Core writing experience.

Features:

* Create Projects
* Edit Projects
* Delete Projects
* Create Notes
* Edit Notes
* Delete Notes
* Project Dashboard
* Project Organization
* Note Detail Pages

---

## Memory Layer

Automatically preserves writing history.

Features:

* Activity Timeline
* Resume Context
* Last Active Tracking
* Recent Activity Feed
* Project History

The application remembers what happened throughout a project's lifetime.

---

## Intent Layer

Preserves creative intent.

Every project maintains:

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions

Helping writers remember **why** they were working and **what should happen next**.

---

## Relationship Layer

Connects creative assets.

Capabilities include:

* Related Notes
* Note References
* Goal Support
* Focus Support
* Next Step Dependencies
* Question Relationships
* Question Status
* Note Categories

Ideas become connected instead of isolated.

---

## Knowledge Layer

Transforms connected information into structured knowledge.

Capabilities include:

* Collections
* Knowledge Spaces
* Knowledge Tags
* Smart References
* Resume Workspace v2
* Project Dashboard v2
* Project Health

Projects become organized knowledge workspaces rather than simple collections of notes.

---

## Writer Intelligence Layer

Transforms structured knowledge into meaningful insights.

Capabilities include:

* Resume Intelligence
* Project Intelligence
* Writing Momentum
* Goal Progress
* Focus Drift Detection
* Question Intelligence
* Creative Gap Analysis
* Weekly Summary
* Smart Dashboard
* Project Health Insights

Writer Intelligence is deterministic.

It derives observations from structured project data without requiring Large Language Models or generative AI.

The intelligence layer does not write for the writer.

It helps the writer understand their own work.

---

## Memory Graph v1

Memory Graph makes Lekhak's accumulated understanding visible.

Instead of forcing writers to navigate creative memory through lists alone, Lekhak can project existing project data into an interactive visual memory space.

The graph represents:

* Projects
* Collections
* Notes
* Open Questions
* Knowledge Tags

Relationships between these entities become semantic graph edges.

Examples include:

* Note Relationships
* Collection Membership
* Knowledge Tags
* Question Answers
* Intent Relationships
* Goal Support
* Focus Relevance
* Next Step Dependencies

The Memory Graph is a **projection of existing creative memory**.

It is not a separate source of truth.

---

### Contextual Memory Exploration

The graph does not render an entire project without context by default.

Writers can enter memory through contextual entry points.

Current entry points include:

* Project Memory
* Current Focus
* Suggested Start
* Recent Work
* Open Questions
* Orphan Knowledge

Each entry point reveals a different perspective on the same project memory.

---

### Context Expansion

Selecting an entity reveals its immediate creative neighbourhood.

```text
Selected Memory

↓

Immediate Relationships

↓

Connected Ideas

↓

Relevant Context
```

Relevant connections emerge.

Unrelated memories fade into the background.

This allows writers to explore context without being overwhelmed by the entire project.

---

### Memory Inspector

Every selected graph entity can be inspected.

The Memory Inspector adapts to the selected entity type and displays relevant information such as:

* Category
* Description
* Project Status
* Last Updated Time
* Intelligence State
* Relationship Context

Writers can navigate from graph entities back to their actual writing workspace.

The graph remains a lens on creative memory.

It does not replace writing.

---

### Memory Trail

Lekhak preserves the writer's current exploration path.

Example:

```text
Project

↓

Chapter Outline

↓

Character Conflict

↓

Unresolved Question

↓

Research Note
```

The Memory Trail allows writers to move backwards through their exploration context.

Memory exploration becomes a journey rather than a sequence of disconnected clicks.

---

### Graph Search and Filters

The Memory Graph includes contextual discovery tools.

Writers can:

* Search projected memory entities
* Filter node types
* Filter relationship types
* Focus on specific creative structures

The graph can therefore act as both an exploration surface and a visual navigation system.

---

### Intelligence Overlay

Writer Intelligence is mapped into visual memory state.

The graph can surface concepts such as:

* Orphan Knowledge
* Dormant Projects
* Active Projects
* Suggested Starting Points
* Unresolved Questions
* Focus-Relevant Notes

Intelligence calculations remain independent from visualization.

The graph only visualizes insights already derived by the Writer Intelligence Layer.

---

# Memory Graph Architecture

The graph system follows a renderer-independent architecture.

```text
Domain Layer

↓

Graph Projection Layer

↓

Graph Projection

↓

Renderer Adapter

↓

Renderer

↓

Memory Graph UI
```

The current renderer uses:

```text
@xyflow/react
```

Visualization-library dependencies are isolated behind a renderer adapter.

The core graph domain does not depend on React Flow.

---

## Renderer Boundary

```text
GraphProjection
      │
      ├── React Flow Adapter
      │
      ↓
      2D Memory Graph
      │
      └── Future Renderer Adapters
                 ↓
          Spatial Memory
```

This architecture allows future visualization systems to consume the same memory projection without replacing the underlying graph model.

---

# Architecture

Lekhak follows a layered architecture.

```text
UI

↓

Components

↓

Memory Graph Renderer

↓

Graph Projection Layer

↓

Writer Intelligence

↓

Knowledge Layer

↓

Relationship Layer

↓

Intent Layer

↓

Memory Layer

↓

Service Layer

↓

Supabase

↓

PostgreSQL
```

Each layer builds upon the previous one while maintaining clear separation of responsibilities.

---

# Core Data Model

```text
Project
│
├── Intent
│     ├── Goal
│     ├── Current Focus
│     ├── Next Step
│     └── Questions
│
├── Collections
│
├── Notes
│
├── Relationships
│
├── Knowledge
│
├── Intelligence
│
├── Graph Projection
│
└── Activity
```

Every capability in Lekhak ultimately revolves around the project and its accumulated creative memory.

---

# Graph Domain Model

The graph domain is visualization-library independent.

Core concepts include:

```text
GraphNode

GraphEdge

GraphProjection

GraphNodeState

GraphRelationshipType

GraphEntryPoint

GraphAdjacency
```

Supported memory node types include:

```text
Project

Collection

Note

Question

Knowledge Tag
```

Graph state can represent:

```text
Orphan

Dormant

Active

Suggested Start

Unresolved

Focus Relevant
```

This domain model forms the foundation for future spatial memory systems.

---

# Technology Stack

## Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Memory Graph

* @xyflow/react
* Renderer Adapter Architecture
* Renderer-Independent Graph Projection

---

## Backend

* Supabase

---

## Database

* PostgreSQL

---

## Authentication

* Supabase Auth
* @supabase/ssr

---

## Validation

* Zod
* React Hook Form

---

# Local Development

## Prerequisites

* Node.js 20+
* npm
* Supabase Project

---

## Clone Repository

```bash
git clone https://github.com/raghavendrashivam474/lekhak.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Start Development Server

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

v0.9

Current Milestone

Memory Graph v1

Development Status

Active Development
```

Lekhak currently:

```text
Stores what exists

Remembers what changed

Preserves why work exists

Connects related ideas

Organizes creative knowledge

Interprets writing patterns

Visualizes accumulated memory
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
* ✅ Writer Intelligence Layer
* ✅ Memory Graph v1

---

## Next

### Spatial Memory Foundation

The next stage explores whether creative memory can be understood spatially.

Potential capabilities include:

* Spatial Graph Projection
* Three-Dimensional Memory Navigation
* Semantic Spatial Layout
* Contextual Camera Movement
* Depth-Based Memory Representation
* Spatial Focus Modes

The objective is not to make Lekhak visually impressive for its own sake.

The objective is to determine whether spatial representation improves creative understanding.

---

## Future

### Spatial Memory

Long-term research includes:

* Three-Dimensional Knowledge Navigation
* Memory Constellations
* Spatial Project Exploration
* Contextual Memory Worlds
* Immersive Creative Navigation

3D visualization will be introduced only when it meaningfully improves understanding rather than serving as decoration.

---

## Long-Term Vision

### Creative Operating System

The ultimate goal of Lekhak is not to become another writing editor.

Its goal is to become a complete creative operating system that helps writers:

* Capture Ideas
* Preserve Memory
* Maintain Intent
* Build Relationships
* Organize Knowledge
* Understand Patterns
* Explore Creative Memory
* Navigate Creative Spaces
* Resume Work Instantly

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

The destination is not another note-taking application.

The destination is a system that remembers creative journeys.

A place where writers can return months—or even years—later and immediately understand:

> What was I building?

> Why was I building it?

> How do these ideas connect?

> What deserves my attention?

> Where should I continue?

And eventually:

> How can I move through everything I once understood?

That is the future Lekhak is being built toward.

---

# Motto

> **The Memory Layer for Writers.**

---

# License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.
