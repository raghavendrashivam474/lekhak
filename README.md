# Lekhak

> The Memory Layer for Writers.

---

## Vision

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

Its purpose is to help writers remember not only what they wrote, but also the journey behind their work.

---

## Core Philosophy

> Remember every story.
>
> Remember every idea.
>
> Remember why you started.

Traditional tools focus on writing.

Lekhak focuses on memory.

---

## The Problem

Modern writing workflows are fragmented.

Writers often have:

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

Over time, context becomes scattered.

Months later, returning to a project often feels like starting over.

Questions writers frequently ask:

* Why did I create this project?
* What was I trying to say?
* Which note was important?
* What changed recently?
* Where should I continue?

Current tools store information.

Very few preserve context.

---

## The Solution

Lekhak acts as a memory system for writers.

Instead of only storing notes and projects, it gradually builds a history around a writer's work.

Lekhak helps users:

* Organize projects
* Store notes
* Track activity
* Understand project history
* Resume work quickly
* Preserve writing context

---

# Current Features

## Authentication

* User Registration
* User Login
* User Logout
* Protected Routes
* Server-Side Authentication
* Session Management

---

## Projects

* Create Project
* Edit Project
* Delete Project
* View Project Details
* Last Active Information

---

## Notes

* Create Notes
* Edit Notes
* Delete Notes
* View Note Details
* Project-Based Organization

---

## Memory Layer v1

### Activity Tracking

Automatically records:

* Project Creation
* Project Updates
* Project Deletion
* Note Creation
* Note Updates
* Note Deletion

---

### Recent Activity Feed

View recent actions across all projects.

Examples:

```text
Created Project: Novel Draft

Updated Note: Chapter 4 Outline

Deleted Note: Old Scene Draft
```

---

### Project Timeline

Every project maintains a chronological activity history.

This helps writers understand:

* What changed
* When it changed
* How the project evolved

---

### Resume Context

When returning to a project, Lekhak displays:

* Last Active Time
* Recent Changes
* Most Recently Modified Note

Helping writers immediately continue where they left off.

---

# Product Roadmap

## v0.1 — Foundation

Completed

* Project Setup
* Folder Structure
* Base Layout
* Shared Components

---

## v0.2 — Authentication

Completed

* Supabase Integration
* User Authentication
* Protected Routes
* Database Setup

---

## v0.3 — Writing Workflow

Completed

* Projects
* Notes
* CRUD Operations
* Dashboard

---

## v0.4 — Memory Layer v1

Completed

* Activity Logs
* Timeline
* Resume Context
* SSR Authentication

---

## v0.5 — Context Layer v1

Planned

Focus:

Helping writers understand:

* What they are working on
* Why they are working on it
* What they should do next

Potential Features:

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions

---

## v0.6 — Connections Layer v1

Planned

Focus:

Connecting ideas together.

Potential Features:

* Related Notes
* Idea Relationships
* Linked Projects
* Context References

---

## v0.7 — Writer Intelligence

Future

Potential Features:

* Writing Insights
* Activity Patterns
* Progress Tracking
* Productivity Signals

---

## v1.0 — Public Launch Candidate

Future

Goal:

A complete memory system for writers.

---

# Design Philosophy

Lekhak is designed around three principles.

### Calm

Writing requires focus.

The interface should never feel overwhelming.

---

### Memory

The product should help users remember their journey.

Not just store files.

---

### Growth

Projects should feel alive.

Writers should be able to see how their work evolves over time.

---

## Visual Direction

Inspired by:

* Apple Journal
* Obsidian
* Arc Browser
* Modern Libraries
* Personal Archives

Design Keywords:

```text
Deep Navy
Warm Gold
Soft Cream

Focused
Calm
Timeless
```

---

# Architecture

Current architecture follows a simple service-oriented structure.

```text
UI

↓

Service Layer

↓

Supabase

↓

PostgreSQL
```

---

## Database Tables

### profiles

User information.

### projects

Writing projects.

### notes

Project notes.

### activity_logs

Memory Layer activity history.

---

## Authentication

Authentication is powered by:

```text
Supabase Auth
@supabase/ssr
```

Features:

* Server-Side Sessions
* Protected Routes
* Cookie-Based Authentication

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

## Authentication

* Supabase Auth
* @supabase/ssr

---

# Local Development

## Prerequisites

* Node.js 20+
* npm
* Supabase Project

---

## Installation

Clone repository:

```bash
git clone <repository-url>
```

Install dependencies:

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

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Project Structure

```text
src/

app/
components/
services/
types/
lib/
hooks/

Database:
profiles
projects
notes
activity_logs
```

---

# Current Status

Version:

```text
v0.4
```

Milestone:

```text
Foundation + Writing Workflow + Memory Layer v1
```

Development Status:

```text
Active Development
```

---

# Long-Term Goal

Lekhak is not being built as another writing editor.

The long-term goal is to become a system that helps writers preserve:

* Stories
* Ideas
* Context
* Progress
* Creative history

A place where writers can return months later and immediately understand:

> What was I building?
>
> Why was I building it?
>
> Where do I continue?

---

## Motto

> The Memory Layer for Writers.
