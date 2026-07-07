# Lekhak

> The Memory Layer for Writers.

**Status:** Active Development
**Version:** v0.7
**License:** MIT

---

# About

Lekhak was created by **Raghav** to solve a problem experienced by writers.

> Writers rarely lose words.
>
> They lose context.

Lekhak is a memory-first writing workspace designed to preserve not only documents, but also the ideas, intent, relationships, and creative history behind them.

---

# Vision

Most writing tools store documents.

Lekhak preserves context.

Writers rarely lose words.

What they lose is:

* Why they started
* What they were trying to achieve
* Where an idea came from
* What changed over time
* Where they left off

Lekhak is being built to solve that problem.

Its purpose is to help writers remember not only what they wrote, but also the creative journey behind their work.

---

## v0.7 — Knowledge Layer v1

Current focus:

* Writer Intelligence
* Cross-Project Knowledge
* Creative Insights
* Memory Graph Foundation

---

# Core Philosophy

> Remember every story.
>
> Remember every idea.
>
> Remember why you started.

Traditional writing software stores documents.

Lekhak preserves memory.

---

# The Problem

Modern writing workflows are fragmented.

Writers often manage information across:

```text
Google Docs
Notion
Voice Notes
Research PDFs
Random Notes
Bookmarks
Screenshots
Ideas on Paper
```

Over time, creative context becomes scattered.

Months later, returning to a project often feels like starting over.

Common questions become:

* Why did I start this?
* What was I trying to solve?
* Which note mattered?
* What changed recently?
* Where should I continue?

Most writing software stores information.

Very little software preserves creative context.

---

# The Solution

Lekhak acts as a memory system for writers.

Instead of simply storing notes, Lekhak gradually builds an understanding of:

* Projects
* Notes
* Activity
* Intent
* Relationships
* Knowledge

allowing writers to immediately reconnect with their work after days, weeks, or months away.

---

# Current Features

## Authentication

* User Registration
* User Login
* User Logout
* Protected Routes
* Server-Side Authentication
* Cookie-Based Sessions

---

## Projects

* Create Projects
* Edit Projects
* Delete Projects
* Project Dashboard
* Last Active Information

---

## Notes

* Create Notes
* Edit Notes
* Delete Notes
* Project Organization
* Note Detail Pages

---

## Memory Layer v1

Automatically preserves:

* Project Activity
* Note Activity
* Timeline History
* Resume Context
* Recent Activity Feed

---

## Intent Layer v1

Every project now includes:

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions

Helping writers preserve creative intent between writing sessions.

---

## Relationship Layer v1

Lekhak now understands relationships between creative assets.

Capabilities include:

* Note References
* Related Notes
* Question-to-Note Relationships
* Goal Support
* Focus Support
* Next Step Dependencies
* Question Status
* Note Categories

These relationships form the foundation for future intelligence features.

---

---

## Knowledge Layer v1

Sprint 7 transforms connected information into organized knowledge.

Capabilities include:

* Collections
* Knowledge Spaces
* Knowledge Tags
* Smart References
* Project Health
* Resume Workspace v2
* Dashboard v2

The project is no longer a collection of notes.

It becomes an organized knowledge workspace that helps writers navigate ideas through structure rather than memory alone.

---

# Product Roadmap

## v0.1 — Foundation ✅

* Project Setup
* Folder Structure
* Shared Layout
* Base Components

---

## v0.2 — Authentication ✅

* Supabase Integration
* Authentication
* Protected Routes
* Database Setup

---

## v0.3 — Writing Workflow ✅

* Projects
* Notes
* Dashboard
* CRUD Operations

---

## v0.4 — Memory Layer ✅

* Activity Logs
* Timeline
* Resume Context
* SSR Authentication

---

## v0.5 — Intent Layer ✅

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions

---

## v0.6 — Relationship Layer ✅

* Note References
* Related Notes
* Question Relationships
* Goal Support
* Focus Support
* Note Categories
* Question Status

---

## v0.7 — Knowledge Layer ✅

* Collections
* Knowledge Spaces
* Knowledge Tags
* Smart References
* Resume Workspace v2
* Dashboard v2
* Project Health

---

## v0.8 — Writer Intelligence

Planned

Potential capabilities:

* Smart Resume
* Writing Insights
* Pattern Recognition
* Project Health Insights
* Knowledge Recommendations
* Writing Momentum
* Stale Project Detection

---

## v0.9 — Memory Graph

Planned

Potential capabilities:

* Interactive Knowledge Graph
* Cross-Project Navigation
* Relationship Explorer
* Context Navigation
* Visual Knowledge Maps

---

## v1.0 — Creative Operating System

Goal:

A complete creative memory system for writers.

---

# Design Philosophy

Lekhak is built around three principles.

## Calm

Writing requires focus.

The interface should remain quiet and distraction-free.

---

## Memory

The product should preserve the creative journey.

Not just documents.

---

## Growth

Creative work should feel alive.

Writers should see how ideas evolve over time.

---

## Relationships

Ideas become more valuable when connected.

Lekhak should help writers understand how their thoughts, notes, and questions relate.

---
---

## Knowledge

Knowledge should emerge naturally from relationships.

The application should organize ideas into meaningful structures, helping writers navigate concepts instead of searching through disconnected notes.

---

## Knowledge

Knowledge should emerge naturally from relationships.

The application should organize ideas into meaningful structures, helping writers navigate concepts instead of searching through disconnected notes.

## Knowledge

Knowledge should emerge naturally from relationships.

The application should organize ideas into meaningful structures, helping writers navigate concepts instead of searching through disconnected notes.

# Architecture

Current architecture follows a layered service-oriented design.

```text
UI

↓

Components

↓

Service Layer

↓

Knowledge Layer

↓

Supabase

↓

PostgreSQL
```

Business logic remains inside the service layer.

Pages never communicate directly with the database.

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
│     └── Notes
│
├── Relationships
│
├── Knowledge Tags
│
├── Project Health
│
└── Activity
```

---

# Database

Current tables:

* profiles
* projects
* notes
* activity_logs
* relationships
* intent_links
* collections
* note_collections
* knowledge_tags
* note_tags

---

# Authentication

Powered by:

```text
Supabase Auth
@supabase/ssr
```

Features:

* Server-Side Sessions
* Cookie Authentication
* Protected Routes

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

## Installation

```bash
git clone https://github.com/raghavendrashivam474/lekhak.git
```

```bash
npm install
```

Create:

```env
.env.local
```

Add:

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
Version: v0.7

Milestone:
Foundation
→ Memory
→ Intent
→ Relationships
→ Knowledge

Status:
Active Development
```

---

# Documentation

Additional documentation:

* docs/PRODUCT_VISION.md
* docs/ROADMAP.md
* docs/ARCHITECTURE.md
* docs/DESIGN_PHILOSOPHY.md
* docs/3D_PHILOSOPHY.md
* docs/HANDOVER.md
* docs/CONTRIBUTING.md
* docs/CHANGELOG.md

---

# Long-Term Goal

Lekhak is not being built as another writing editor.

Its long-term vision is to become a creative knowledge system that preserves:

* Stories
* Ideas
* Intent
* Relationships
* Knowledge
* Context
* Progress
* Creative History

A place where writers can return months later and immediately understand:

> What was I building?
>
> Why was I building it?
>
> How do my ideas connect?
>
> Where should I continue?

---

# Motto

> The Memory Layer for Writers.

---

# Founder

**Raghavendra Singh**

Engineering Student, Builder, and Creator.

Lekhak is an attempt to preserve creative context and help writers reconnect with their ideas long after they were written.

---

# License

This project is licensed under the MIT License.

See the LICENSE file for details.
