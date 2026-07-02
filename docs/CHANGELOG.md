# Changelog

All notable changes to **Lekhak** will be documented in this file.

This project follows a milestone-based versioning strategy during active development.

The structure of this document is inspired by **Keep a Changelog**.

---

# [v0.6] - July 2026

## Release Name

**Connections Layer v1**

---

## Highlights

This release transforms Lekhak from an intent-aware writing workspace into a connected knowledge system.

Writers can now establish meaningful relationships between their creative assets, allowing projects to evolve into interconnected knowledge spaces instead of isolated notes.

---

## Added

### Relationships

* Note-to-note relationships
* Related notes
* Note references
* Goal support relationships
* Current focus support relationships
* Open question relationships
* Relationship categorization
* Relationship management service
* Relationship-aware project workspace

---

### Navigation

* Relationship discovery within projects
* Faster movement between connected ideas
* Relationship-aware writing workflow

---

### Architecture

* Dedicated Relationship Service
* Relationship entity models
* Relationship validation
* Relationship database support
* Extensible relationship architecture for future graph visualization

---

## Improved

### Project Workspace

Projects now combine:

* Memory
* Intent
* Relationships

creating a significantly richer writing environment.

---

### Application Architecture

The application architecture now consists of five major capability layers:

```text
Writing

↓

Memory

↓

Intent

↓

Relationships

↓

Future Intelligence
```

---

## Known Limitations

* Relationship visualization is list-based
* No graphical relationship explorer
* Relationship analytics not yet implemented

---

# [v0.5] - July 2026

## Release Name

**Context Layer v1**

---

## Highlights

Sprint 5 introduced the Intent Layer.

Lekhak now preserves not only what writers create, but also why they are creating it and what they should work on next.

---

## Added

### Intent System

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions

---

### Project Workspace

* Intent Panel
* Inline editing
* Independent field saving
* Project context preservation

---

### Architecture

* Intent-aware Projects Service
* Intent validation
* Intent data model

---

## Improved

Projects evolved from passive note containers into active writing workspaces.

---

## Known Limitations

* Intent history not preserved
* Open questions cannot be reordered
* Plain text only

---

# [v0.4] - June 2026

## Release Name

**Memory Layer v1**

---

## Highlights

Introduced Lekhak's first Memory Layer.

The application now preserves project history and helps writers resume work after long breaks.

---

## Added

### Authentication

* Server-side authentication using `@supabase/ssr`
* Cookie-based session management
* Protected routes through `proxy.ts`

---

### Projects

* Create
* View
* Edit
* Delete
* Project detail pages

---

### Notes

* Create
* View
* Edit
* Delete
* Note detail pages

---

### Dashboard

* Live project counts
* Live note counts
* Recently active projects
* Recent activity feed

---

### Memory Layer

* Activity logging
* Resume Context
* Project Timeline
* Last Active tracking
* Activity history

---

### Infrastructure

* Service-oriented architecture
* Zod validation
* React Hook Form integration
* Supabase integration
* Row Level Security

---

## Changed

### Authentication

Migrated from client-side authentication to server-side authentication using `@supabase/ssr`.

Benefits:

* No loading flash
* Better security
* SSR support

---

### Dashboard

Replaced placeholder content with live database-driven content.

---

### Layout

Separated application into:

```text
(auth)

(app)
```

route groups.

---

## Fixed

### Authentication

* Redirect loops
* Session race conditions
* Loading flashes

### Routing

* Incorrect AppShell rendering
* Route group organization

### Supabase

* Multiple GoTrueClient instances
* Client initialization improvements

---

## Known Limitations

* Activity deduplication not implemented
* Activity pagination not implemented
* Placeholder pages remain

---

# [v0.3] - June 2026

## Release Name

**Writing Workflow**

---

## Added

### Projects

* Complete Project CRUD

### Notes

* Complete Note CRUD

### Dashboard

* Initial dashboard

### Validation

* Project validation
* Note validation

### Services

* Projects Service
* Notes Service

---

## Outcome

Established the first complete writing workflow.

```text
Login

↓

Create Project

↓

Create Note

↓

Open Note

↓

Continue Writing
```

---

# [v0.2] - June 2026

## Release Name

**Authentication Foundation**

---

## Added

### Supabase

* Database integration
* Authentication
* Profile creation

### Security

* Row Level Security
* Protected routes

### User Management

* Registration
* Login
* Logout

---

## Outcome

Established a secure multi-user foundation.

---

# [v0.1] - June 2026

## Release Name

**Project Foundation**

---

## Added

### Initial Setup

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

### Architecture

* Service Layer
* Folder structure
* Shared layouts
* Routing foundation

### Development

* Git repository
* Documentation
* Engineering conventions

---

## Outcome

Established the technical foundation for future development.

---

# Upcoming

## v0.7 — Writer Intelligence

Planned capabilities include:

* Creative insights
* Writing patterns
* Dormant project detection
* Progress analysis
* Project health indicators
* Writing momentum
* Context-aware recommendations

---

## v0.8 — Knowledge Graph

Planned capabilities include:

* Interactive relationship graph
* Graph navigation
* Memory visualization
* Connected knowledge exploration

---

## v0.9 — Creative Workspace

Planned capabilities include:

* Character management
* World building
* Research organization
* Story structure tools
* Writing sessions
* Reference management

---

## v1.0 — Public Launch

**Vision**

A complete memory system for writers.

A place where writers can preserve not only their work, but also the context, intent, relationships, and evolution behind every creative project.

---

*End of Changelog*
