# Architecture

## Lekhak

Version: v0.4

Status: Active Development

Last Updated: June 2026

---

# Purpose

This document explains the technical architecture of Lekhak.

It is intended for developers who need to:

* Understand the system
* Add features
* Debug issues
* Refactor safely
* Contribute to the project

This document focuses on implementation and system structure.

For product reasoning, refer to:

```text
docs/PRODUCT_VISION.md
```

---

# High-Level Architecture

Lekhak currently follows a service-oriented architecture.

```text
User

↓

UI Layer

↓

Service Layer

↓

Supabase

↓

PostgreSQL
```

---

# Architectural Principles

---

## 1. Separation of Concerns

Pages should focus on rendering UI.

Business logic belongs in services.

Database communication belongs in services.

Pages should never directly communicate with Supabase.

---

### Correct

```text
Page

↓

Service

↓

Database
```

---

### Incorrect

```text
Page

↓

Supabase
```

---

## 2. Simplicity First

Current architecture is intentionally simple.

Avoid introducing:

```text
Microservices

Redis

Message Queues

Event Buses

Complex State Systems
```

until there is a demonstrated need.

---

## 3. Incremental Evolution

The architecture should evolve gradually.

Future features should extend the system rather than replace it.

---

# Technology Stack

---

## Frontend

```text
Next.js 16

React

TypeScript

Tailwind CSS

shadcn/ui
```

---

## Backend

```text
Supabase
```

---

## Database

```text
PostgreSQL
```

---

## Authentication

```text
Supabase Auth

@supabase/ssr
```

---

## Validation

```text
React Hook Form

Zod
```

---

# Directory Structure

```text
src/

├── app/
├── components/
├── services/
├── lib/
├── types/
├── hooks/
```

---

# App Router Structure

```text
app/

├── (auth)/
│   ├── login
│   └── signup
│
├── (app)/
│   ├── dashboard
│   ├── projects
│   ├── notes
│   ├── settings
│   ├── timeline
│   ├── characters
│   └── connections
│
└── layout.tsx
```

---

# Route Groups

---

## (auth)

Public routes.

Examples:

```text
/login

/signup
```

No AppShell.

No Sidebar.

No Top Navigation.

---

## (app)

Protected routes.

Examples:

```text
/dashboard

/projects

/notes
```

Wrapped by:

```text
AppShell
```

Includes:

```text
Sidebar

TopNav
```

---

# Authentication Architecture

Authentication is server-side.

Implemented using:

```text
@supabase/ssr
```

---

## Flow

```text
Request

↓

proxy.ts

↓

Read Session Cookie

↓

Authenticated?

↓

Yes → Continue

No → Redirect
```

---

## Session Storage

Sessions are stored in cookies.

Benefits:

```text
Server Components

No Loading Flash

Better Security

SSR Support
```

---

# Database Architecture

---

## profiles

Stores user information.

Columns:

```text
id

email

full_name

avatar_url

created_at
```

---

## projects

Stores writing projects.

Columns:

```text
id

user_id

title

description

status

created_at

updated_at
```

---

## notes

Stores notes associated with projects.

Columns:

```text
id

project_id

user_id

title

content

created_at

updated_at
```

---

## activity_logs

Stores memory history.

Columns:

```text
id

user_id

project_id

entity_type

entity_id

action

metadata

created_at
```

---

# Row Level Security

RLS is enabled on all tables.

Principle:

```text
Users may only access their own data.
```

All queries rely on RLS for protection.

---

# Service Layer

All business logic lives here.

```text
src/services/
```

---

## Auth Service

```text
src/services/auth
```

Responsibilities:

```text
signUp

signIn

signOut

getCurrentUser
```

---

## Projects Service

```text
src/services/projects
```

Responsibilities:

```text
createProject

getProjects

getProjectById

updateProject

deleteProject
```

---

## Notes Service

```text
src/services/notes
```

Responsibilities:

```text
createNote

getNotesByProject

getNoteById

updateNote

deleteNote
```

---

## Activity Service

```text
src/services/activity
```

Responsibilities:

```text
logActivity

getActivityFeed

getProjectActivity
```

---

# Activity System

The activity system powers the Memory Layer.

---

## Supported Events

```text
project_created

project_updated

project_deleted

note_created

note_updated

note_deleted
```

---

## Logging Strategy

Every successful mutation automatically creates an activity record.

Implementation location:

```text
Service Layer
```

Never:

```text
UI Layer
```

---

# Resume Context

Current implementation derives context from:

```text
Recent Activity

Most Recent Note

Last Active Information
```

This powers:

```text
Where You Left Off
```

inside project pages.

---

# Validation Layer

Validation is centralized.

Location:

```text
src/lib/validations
```

Current schemas:

```text
projectSchema

noteSchema

updateNoteSchema
```

Future schemas should be added here.

---

# Type Definitions

Shared types live in:

```text
src/types
```

Examples:

```text
Project

Note

ActivityLog
```

Pages and services should import types from here.

---

# Error Handling

Current strategy:

```text
Service Layer

↓

Throw Error

↓

Page Handles UI
```

Avoid raw database errors in the UI.

---

# Current System Boundaries

The following systems do not currently exist:

```text
AI

Search

Collaboration

Sharing

Rich Text Editing

Connections Graph

Character Management

Timeline Visualization

Desktop Application
```

These are future roadmap items.

---

# Future Architecture Evolution

Planned additions:

---

## Context Layer

Purpose:

Help writers remember:

```text
Why
```

they were working on something.

---

## Connections Layer

Purpose:

Help writers understand:

```text
How
```

their ideas relate.

---

## Writer Intelligence

Purpose:

Generate insights from writing behavior.

---

# Development Guidelines

When adding new features:

1. Reuse service layer patterns.

2. Keep validation centralized.

3. Preserve RLS protections.

4. Prefer simple solutions.

5. Extend architecture instead of replacing it.

---

# Summary

Lekhak currently consists of:

```text
Authentication

Projects

Notes

Memory Layer
```

The architecture is intentionally lightweight while providing a strong foundation for future growth.

The next major evolution is the Context Layer, followed by Connections and Writer Intelligence.

---

End of Architecture Document
