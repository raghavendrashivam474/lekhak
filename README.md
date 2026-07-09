# Lekhak

> **The Memory Layer for Writers.**

A memory-first writing workspace that helps writers preserve not only what they write, but also **why they wrote it, how their ideas connect, what deserves attention, and where they should continue.**

**Status:** Active Development
**Version:** **v0.8 — Writer Intelligence Layer**
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

---

# The Solution

Lekhak gradually builds an understanding of every writing project.

Instead of only storing content, it learns:

* What changed
* Why it changed
* Which ideas relate
* Which concepts belong together
* Which projects require attention
* How the writer can continue immediately

Every writing session strengthens the application's understanding of the project.

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

Memory Graph (Planned)

↓

Spatial Memory (Future)

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

Helping writers remember **why** they were working.

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

Writer Intelligence is entirely deterministic.

It derives insights from structured project data without relying on Large Language Models or generative AI.

---

# Architecture

Lekhak follows a layered architecture.

```text
UI

↓

Components

↓

Service Layer

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
└── Activity
```

Every capability in Lekhak ultimately revolves around the project.

---

# Technology Stack

## Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

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

v0.8

Current Milestone

Writer Intelligence Layer

Development Status

Active Development
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

---

## Next

### Memory Graph

Planned capabilities:

* Interactive Knowledge Graph
* Relationship Explorer
* Cross-Project Navigation
* Context Visualization
* Visual Memory Navigation

---

## Future

### Spatial Memory

Long-term research includes:

* Three-Dimensional Knowledge Navigation
* Memory Constellations
* Spatial Project Exploration
* Immersive Creative Workspace

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
* Generate Insights
* Navigate Creative Spaces

---

# Documentation

Project documentation is available in the **docs/** directory.

* PRODUCT_VISION.md
* ROADMAP.md
* ARCHITECTURE.md
* DESIGN_PHILOSOPHY.md
* 3D_PHILOSOPHY.md
* HANDOVER.md
* CONTRIBUTING.md
* CHANGELOG.md
* CODE_OF_CONDUCT.md
* SECURITY.md

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

That is the future Lekhak is being built toward.

---

# Motto

> **The Memory Layer for Writers.**

---

# License

This project is licensed under the **MIT License**.

See the **LICENSE** file for details.
