# Contributing Guide

## Lekhak

### The Memory Layer for Writers

Version: v0.4

Status: Active Development

---

# Welcome

Thank you for contributing to Lekhak.

Before making changes, please read:

```text
README.md

PRODUCT_VISION.md

ROADMAP.md

ARCHITECTURE.md

DESIGN_PHILOSOPHY.md

HANDOVER.md
```

Understanding the product philosophy is as important as understanding the code.

---

# Project Philosophy

Lekhak is not a generic note-taking application.

Lekhak is being built as:

> The Memory Layer for Writers.

Every contribution should strengthen one or more of the following:

```text
Memory

Context

Continuity

Creative Workflow
```

If a feature does not improve at least one of these areas, reconsider whether it belongs in the product.

---

# Development Principles

---

## 1. Simplicity First

Prefer:

```text
Simple
Readable
Maintainable
```

Avoid:

```text
Overengineering

Premature Optimization

Unnecessary Abstractions
```

The simplest working solution is usually the correct solution.

---

## 2. Service Layer First

Business logic belongs inside services.

Correct:

```text
Page

↓

Service

↓

Database
```

Incorrect:

```text
Page

↓

Database
```

Pages should never directly communicate with Supabase.

---

## 3. Reuse Existing Patterns

Before creating new architecture:

Check:

```text
src/services

src/types

src/lib/validations
```

Reuse existing patterns whenever possible.

---

## 4. Incremental Development

Large features should be delivered in small steps.

Prefer:

```text
Working Feature

↓

Improve Feature

↓

Expand Feature
```

instead of attempting massive implementations at once.

---

# Repository Structure

Current structure:

```text
src/

├── app/
├── components/
├── services/
├── types/
├── lib/
├── hooks/

docs/
```

---

# Folder Responsibilities

---

## app/

Contains:

```text
Pages

Layouts

Route Groups
```

Should not contain business logic.

---

## components/

Contains:

```text
Reusable UI Components
```

Examples:

```text
Buttons

Dialogs

Forms

Cards
```

---

## services/

Contains:

```text
Business Logic

Database Operations
```

Examples:

```text
Auth Service

Projects Service

Notes Service

Activity Service
```

---

## types/

Contains:

```text
Shared TypeScript Types
```

Examples:

```text
Project

Note

ActivityLog
```

---

## lib/

Contains:

```text
Utilities

Validation

Supabase Clients
```

---

## docs/

Contains:

```text
Documentation

Reports

Roadmaps

Architecture
```

---

# Naming Conventions

---

## Components

Use:

```text
PascalCase
```

Examples:

```text
CreateProjectDialog

EditNoteDialog

ActivityTimeline
```

---

## Files

Use:

```text
camelCase

PascalCase

depending on file type
```

Follow existing project conventions.

---

## Services

Use:

```text
Verb-based names
```

Examples:

```text
createProject()

updateProject()

deleteProject()
```

---

# TypeScript Guidelines

Always prefer explicit types.

Prefer:

```ts
interface Project {
  id: string;
  title: string;
}
```

Avoid:

```ts
any
```

Use `any` only when absolutely unavoidable.

---

# Validation Guidelines

All user input must be validated.

Validation location:

```text
src/lib/validations
```

Use:

```text
Zod
```

for all schemas.

---

# Database Guidelines

---

## Row Level Security

Never bypass RLS.

Assume:

```text
Users should only access their own data.
```

All schema changes must preserve security.

---

## Migrations

Any database change should be documented.

Examples:

```text
New Tables

New Columns

Indexes

Policies
```

must be included in sprint reports.

---

# UI Guidelines

Follow:

```text
DESIGN_PHILOSOPHY.md
```

---

## Approved Keywords

```text
Calm

Focused

Reflective

Readable

Timeless
```

---

## Avoid

```text
Corporate

Busy

Over-Animated

Dashboard Heavy
```

---

# Commit Guidelines

Use meaningful commit messages.

---

## Good Examples

```text
feat: add project context panel

feat: implement activity logging

fix: resolve auth redirect issue

docs: update architecture documentation

refactor: simplify note service
```

---

## Avoid

```text
update

changes

fix

final

latest
```

These provide no useful information.

---

# Pull Request Guidelines

A pull request should answer:

```text
What changed?

Why did it change?

How was it tested?
```

---

# Documentation Requirements

Major features must update:

```text
CHANGELOG.md
```

Significant architectural changes should update:

```text
ARCHITECTURE.md
```

Roadmap-impacting features should update:

```text
ROADMAP.md
```

---

# Before Submitting Code

Verify:

```text
✓ Feature works

✓ No console errors

✓ Types pass

✓ Validation implemented

✓ Documentation updated

✓ Commit message meaningful
```

---

# Current Priorities

As of v0.4:

Highest Priority:

```text
Context Layer
```

Examples:

```text
Project Goal

Current Focus

Next Writing Step

Open Questions

Resume Workspace
```

---

# Features Explicitly Deferred

Do not prioritize:

```text
AI

Collaboration

Desktop App

Mobile App

3D Visualizations

Memory Graph

Story Constellations
```

until roadmap milestones justify them.

---

# Decision Framework

Before building anything, ask:

```text
Does this improve memory?

Does this improve context?

Does this improve continuity?

Does this help writers reconnect with their work?
```

If most answers are "No", reconsider the feature.

---

# Final Principle

Lekhak is not trying to become the most feature-rich writing tool.

It is trying to become the most memorable one.

Every contribution should move the product closer to that goal.

---

## Motto

> Remember every story.
>
> Remember every idea.
>
> Remember why you started.

---

End of Contributing Guide
