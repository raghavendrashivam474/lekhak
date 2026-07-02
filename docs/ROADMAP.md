# Roadmap

## Lekhak

### The Memory Layer for Writers

**Version:** v0.6

**Status:** Active Development

**Last Updated:** July 2026

---

# Purpose

This document outlines the long-term evolution of Lekhak.

The roadmap exists to provide strategic direction rather than fixed deadlines.

It helps contributors understand:

* The current stage of development
* Why each capability exists
* How every milestone builds upon the previous one
* Which features are intentionally deferred
* The long-term vision of the product

This roadmap is **directional**, not contractual.

As the product evolves, priorities may shift while preserving the overall philosophy.

---

# Product Evolution

Lekhak is not being built feature by feature.

It is being built capability by capability.

Each capability solves a different cognitive problem for writers.

The order matters because every new layer depends on the previous one.

---

## Layer 1

### Writing Workflow

Question:

```text
Can writers store and organize their work?
```

Purpose:

Provide a reliable workspace for projects and notes.

Outcome:

Writers can create, edit and organize their writing.

---

## Layer 2

### Memory Layer

Question:

```text
Can writers remember what happened?
```

Purpose:

Preserve writing history.

Outcome:

Writers can understand what changed, when it changed, and where they left off.

---

## Layer 3

### Intent Layer

Question:

```text
Can writers remember why they were working on something?
```

Purpose:

Preserve creative purpose.

Outcome:

Projects always communicate their objective, current focus and next step.

---

## Layer 4

### Relationship Layer

Question:

```text
Can Lekhak understand how ideas relate?
```

Purpose:

Connect isolated pieces of creative knowledge.

Outcome:

Projects become interconnected knowledge systems rather than collections of notes.

---

## Layer 5

### Writer Intelligence

Question:

```text
Can Lekhak help writers think?
```

Purpose:

Use accumulated knowledge to assist—not replace—the writer.

Outcome:

The system begins providing meaningful insights and guidance.

---

## Layer 6

### Knowledge Visualization

Question:

```text
Can writers explore their creative knowledge visually?
```

Purpose:

Represent relationships through meaningful visualizations.

Outcome:

Writers understand their work spatially rather than only through lists.

---

## Layer 7

### Creative Operating System

Question:

```text
Can Lekhak become the central home for a writer's creative life?
```

Purpose:

Unify every aspect of the creative process.

Outcome:

One workspace for ideas, projects, research, planning and creative history.

---

# Completed Milestones

---

## v0.1 — Foundation

**Status**

```text
Completed
```

### Delivered

* Project setup
* Next.js application
* Folder structure
* Shared layouts
* Service architecture
* Type system
* Validation structure
* Git repository

### Outcome

Established a scalable technical foundation.

---

## v0.2 — Authentication

**Status**

```text
Completed
```

### Delivered

* Supabase integration
* User authentication
* Protected routes
* User profiles
* Row Level Security
* Server-side authentication

### Outcome

Every writer receives a secure personal workspace.

---

## v0.3 — Writing Workflow

**Status**

```text
Completed
```

### Delivered

* Projects
* Notes
* Dashboard
* CRUD operations
* Validation
* Service layer
* Project organization

### Outcome

Writers can capture and organize creative work.

---

## v0.4 — Memory Layer

**Status**

```text
Completed
```

### Delivered

* Activity logs
* Recent activity feed
* Resume Context
* Project timeline
* Last active tracking
* SSR authentication
* Activity services

### Outcome

Lekhak remembers what happened.

Writers can immediately understand the recent history of every project.

---

## v0.5 — Intent Layer

**Status**

```text
Completed
```

### Objective

Preserve the writer's creative intent.

### Delivered

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions
* Intent Panel
* Inline editing
* Intent validation
* Intent services

### Outcome

Lekhak remembers why writers are working on a project and what they intended to do next.

Projects become active workspaces instead of passive containers.

---

## v0.6 — Relationship Layer

**Status**

```text
Completed
```

### Objective

Teach Lekhak how creative ideas relate.

### Delivered

* Note References
* Related Notes
* Question-to-Note Relationships
* Goal Support
* Focus Support
* Next Step Dependencies
* Question Status
* Note Categories
* Relationship services
* Relationship management interface

### Outcome

Lekhak no longer stores isolated information.

It understands meaningful relationships between creative assets.

This establishes the foundation for future Writer Intelligence and visualization systems.

---

# Next Milestone

## v0.7 — Writer Intelligence

**Status**

```text
Planned
```

### Objective

Transform stored knowledge into meaningful assistance.

Rather than merely remembering information, Lekhak begins helping writers make progress.

---

### Planned Capabilities

#### Smart Resume

Examples:

```text
You were revising Chapter 6.

Two questions remain unanswered.

Your next suggested step is to complete Scene 14.
```

---

#### Creative Momentum

Examples:

```text
Most active project

Writing streak

Momentum trends

Creative consistency
```

---

#### Writing Insights

Examples:

```text
Projects needing attention

Unanswered questions

Frequently referenced notes

Most connected ideas
```

---

#### Project Health

Examples:

```text
Dormant projects

Incomplete drafts

Projects nearing completion

Focus distribution
```

---

### Outcome

Lekhak begins supporting the writer's thinking process.

---

# Future Milestones

---

## v0.8 — Knowledge Visualization

**Status**

```text
Future
```

### Objective

Visualize relationships instead of listing them.

---

### Potential Capabilities

```text
Relationship Graph

Idea Networks

Creative Clusters

Question Networks

Context Navigation
```

---

### Technology Candidates

```text
React Flow
```

Visualization must communicate meaning rather than decoration.

### Outcome

Writers can explore their knowledge visually.

---

## v0.9 — Spatial Memory

**Status**

```text
Future
```

### Objective

Represent creative memory through meaningful three-dimensional space.

---

### Potential Capabilities

```text
Memory Constellation

Spatial Navigation

Creative Universe

Knowledge Space

Interactive Memory Exploration
```

This stage follows the principles defined in:

```text
docs/3D_PHILOSOPHY.md
```

### Outcome

Space becomes a representation of memory rather than visual decoration.

---

## v1.0 — Creative Operating System

**Status**

```text
Long-Term Goal
```

### Objective

Deliver a complete creative operating system for writers.

---

### Core Capabilities

```text
Writing

↓

Memory

↓

Intent

↓

Relationships

↓

Writer Intelligence

↓

Knowledge Visualization

↓

Spatial Memory
```

---

### Success Criteria

A writer should be able to:

```text
Capture Ideas

Write Notes

Track Progress

Preserve Intent

Explore Relationships

Understand Context

Resume Work Instantly

Navigate Years of Creative History
```

without relying on multiple disconnected tools.

---

# Deferred Features

The following capabilities are intentionally postponed.

---

## AI Content Generation

Examples:

```text
Story Generation

Poem Generation

Dialogue Generation

Automatic Rewriting
```

Reason:

Lekhak is designed to augment creativity, not replace it.

The priority is understanding the writer before generating content.

---

## Collaboration

Examples:

```text
Shared Projects

Real-time Editing

Comments

Team Workspaces
```

Reason:

Single-user experience remains the priority.

---

## Desktop Application

Platforms:

```text
Windows

macOS

Linux
```

Reason:

The web experience must mature first.

---

## Mobile Application

Reason:

Writing workflows are currently optimized for larger screens.

---

## Advanced 3D Experiences

Examples:

```text
Immersive Worlds

Virtual Reality

Decorative 3D Environments
```

Reason:

Three-dimensional interfaces should only be introduced when they improve understanding.

---

# Guiding Principle

When choosing between two features, prioritize the one that improves:

```text
Memory

↓

Intent

↓

Relationships

↓

Understanding

↓

Continuity
```

over features that merely increase complexity.

Every capability should reduce cognitive load.

---

# Long-Term Vision

Lekhak is not being built as another writing editor.

It is being built as a system that preserves creative journeys.

A place where writers can return months—or years—later and immediately understand:

* What they created
* Why they created it
* How their ideas relate
* How their work evolved
* What should happen next

---

# Roadmap Motto

> Write with clarity.
>
> Remember with confidence.
>
> Connect ideas.
>
> Build lasting creative knowledge.

---

*End of Roadmap*
