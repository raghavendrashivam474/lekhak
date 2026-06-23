# HANDOVER

## Lekhak

### The Memory Layer for Writers

Version: v0.4

Status: Active Development

Last Updated: June 2026

Prepared By: Founding Team

---

# Purpose

This document serves as the primary onboarding and continuity document for Lekhak.

Any developer joining the project should read this document before contributing.

This document explains:

* Why the product exists
* What has been built
* What remains unfinished
* What should be built next
* What should not be built yet
* Architectural decisions
* Product philosophy

This file should provide enough context for development to continue even if the original contributors are unavailable.

---

# Executive Summary

Lekhak is a writing memory system.

The project began with a simple observation:

> Writers do not lose words.
>
> Writers lose context.

Most writing tools successfully store documents.

Very few help writers remember:

* Why they started
* What they were working on
* What changed recently
* What remains unfinished

Lekhak is being built to solve that problem.

---

# Product Identity

---

## What Lekhak Is

```text
A Memory Layer

A Context Layer

A Creative Archive

A Writing Companion
```

---

## What Lekhak Is Not

```text
Not Google Docs

Not Notion

Not Trello

Not Jira

Not a Project Management Tool

Not a Generic Notes Application
```

---

# Product Mission

Help writers remember:

```text
Every Story

Every Idea

Every Decision

Every Revision

Every Journey
```

---

# Core Insight

The entire product exists because of one belief:

> Context is more valuable than content.

Content can always be found.

Context is what disappears.

---

# Development Philosophy

The product is intentionally being developed in layers.

Each layer solves a different problem.

Development order matters.

---

## Layer 1

Writing Workflow

Question:

```text
Can users store their work?
```

Completed.

---

## Layer 2

Memory Layer

Question:

```text
Can users remember what happened?
```

Completed.

---

## Layer 3

Context Layer

Question:

```text
Can users remember why they were working on something?
```

Planned.

---

## Layer 4

Connections Layer

Question:

```text
How do ideas relate?
```

Future.

---

## Layer 5

Writer Intelligence

Question:

```text
What patterns exist?
```

Future.

---

# Current Product Status

Current Version:

```text
v0.4
```

Current Milestone:

```text
Foundation

Writing Workflow

Memory Layer v1
```

The application is currently usable by real users.

---

# Implemented Features

---

## Authentication

Status:

Completed

Features:

```text
Signup

Login

Logout

Protected Routes

SSR Authentication

Cookie Sessions
```

Technology:

```text
Supabase Auth

@supabase/ssr
```

---

## Projects

Status:

Completed

Features:

```text
Create

Edit

Delete

View

Recent Activity
```

---

## Notes

Status:

Completed

Features:

```text
Create

Edit

Delete

View
```

---

## Dashboard

Status:

Completed

Features:

```text
Project Count

Note Count

Recent Activity

Recently Active Projects
```

---

## Memory Layer

Status:

Completed (Version 1)

Features:

```text
Activity Tracking

Timeline

Resume Context

Last Active Information
```

---

# Database Overview

Current Tables:

```text
profiles

projects

notes

activity_logs
```

---

## profiles

Stores:

```text
User Information
```

Relationship:

```text
auth.users

↓

profiles
```

---

## projects

Stores:

```text
Writing Projects
```

Owned by:

```text
User
```

---

## notes

Stores:

```text
Project Notes
```

Belongs to:

```text
Project
```

---

## activity_logs

Stores:

```text
History

Events

Timeline Data
```

Powers:

```text
Memory Layer
```

---

# Technical Architecture

High-level flow:

```text
UI

↓

Services

↓

Supabase

↓

PostgreSQL
```

---

# Important Architectural Rule

Pages should never directly communicate with Supabase.

Always:

```text
Page

↓

Service

↓

Database
```

Never:

```text
Page

↓

Database
```

---

# Current Service Layers

---

## Auth Service

Location:

```text
src/services/auth
```

Responsibilities:

```text
Authentication
```

---

## Projects Service

Location:

```text
src/services/projects
```

Responsibilities:

```text
Project Operations
```

---

## Notes Service

Location:

```text
src/services/notes
```

Responsibilities:

```text
Note Operations
```

---

## Activity Service

Location:

```text
src/services/activity
```

Responsibilities:

```text
Activity Logging

Activity Retrieval
```

---

# Authentication Flow

Current implementation:

```text
Request

↓

proxy.ts

↓

Read Session

↓

Authenticated?

↓

Yes → Continue

No → Redirect
```

This architecture should remain.

Avoid reverting to client-side guards.

---

# Current Design Direction

Visual Identity:

```text
Deep Navy

Warm Gold

Soft Cream
```

Emotional Goals:

```text
Calm

Focused

Reflective

Trustworthy
```

---

# Design Inspirations

Approved:

```text
Apple Journal

Obsidian

Arc Browser

Libraries

Personal Archives
```

Avoid:

```text
Enterprise Dashboards

Corporate SaaS

CRM Interfaces
```

---

# Known Limitations

These are known and accepted.

---

## Activity Feed

Current limitation:

```text
Rapid edits generate multiple entries.
```

Status:

Accepted.

---

## Activity Pagination

Current limitation:

```text
Dashboard: 10 entries

Project Page: 20 entries
```

Status:

Accepted.

---

## Placeholder Pages

Still placeholders:

```text
/characters

/connections

/timeline

/settings
```

Status:

Intentional.

Do not prioritize yet.

---

# Deferred Features

The following are intentionally postponed.

Do not start them without updating roadmap priorities.

---

## AI

Examples:

```text
Writing Assistant

Summarization

Idea Generation
```

Reason:

Core memory system must mature first.

---

## Search

Reason:

Current scale does not justify complexity.

---

## Collaboration

Reason:

Single-user workflow remains the priority.

---

## Desktop Application

Reason:

Web application must stabilize first.

Future candidate:

```text
Tauri
```

---

## Mobile Application

Reason:

Not currently required.

---

## Graph Views

Examples:

```text
Knowledge Graph

Story Graph

Memory Graph
```

Reason:

Requires mature connections layer first.

---

## 3D Experiences

Examples:

```text
Story Universe

Memory Constellation

Writing Galaxy
```

Reason:

Requires mature data model first.

---

# Immediate Next Priority

Next milestone:

```text
Context Layer v1
```

Goal:

Help writers remember:

```text
Why
```

they were working on something.

---

# Planned Sprint 5 Direction

Potential additions:

```text
Project Goal

Current Focus

Next Writing Step

Open Questions

Continue Writing Workspace
```

This is currently the highest-priority product initiative.

---

# Decision Framework

Before building any feature, ask:

---

## Does this improve memory?

---

## Does this improve context?

---

## Does this improve continuity?

---

## Does this reduce friction for writers?

---

## Does this align with the product vision?

If the answer is "No", reconsider the feature.

---

# Repository Documentation

Required reading order:

```text
README.md

↓

PRODUCT_VISION.md

↓

ROADMAP.md

↓

ARCHITECTURE.md

↓

DESIGN_PHILOSOPHY.md

↓

HANDOVER.md
```

---

# Recovery Procedure

If development resumes after a long pause:

Step 1

Read:

```text
README.md
```

Step 2

Read:

```text
HANDOVER.md
```

Step 3

Review latest Sprint Report.

Step 4

Review Roadmap.

Step 5

Resume from highest-priority milestone.

---

# Long-Term Vision

The final goal is not another writing editor.

The final goal is:

> A system that remembers creative journeys.

A place where writers can return after months or years and immediately understand:

```text
What was I building?

Why was I building it?

How has it evolved?

What should I do next?
```

When that experience becomes effortless, Lekhak succeeds.

---

# Final Motto

> Remember every story.
>
> Remember every idea.
>
> Remember why you started.

---

End of Handover Document
