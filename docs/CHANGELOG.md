# Changelog

All notable changes to Lekhak will be documented in this file.

The format is inspired by Keep a Changelog.

Versioning follows a milestone-based approach during early development.

---

# [v0.4] - June 2026

## Release Name

Memory Layer v1

---

## Added

### Authentication

* Server-side authentication using `@supabase/ssr`
* Cookie-based session management
* Protected route handling through `proxy.ts`
* Login functionality
* Signup functionality
* Logout functionality

---

### Projects

* Create projects
* View project listings
* Edit project details
* Delete projects
* Project detail pages

---

### Notes

* Create notes
* View notes
* Edit notes
* Delete notes
* Note detail pages

---

### Dashboard

* Live project counts
* Live note counts
* Recently active projects
* Recent activity feed

---

### Memory Layer

* Activity logging system
* Activity timeline
* Resume context
* Last active tracking
* Project activity history

---

### Infrastructure

* Service layer architecture
* Zod validation
* React Hook Form integration
* Supabase database integration
* Row Level Security policies

---

## Changed

### Authentication

Migrated from:

```text
Client-side route guards
```

to:

```text
Server-side authentication
```

Benefits:

* No loading flash
* Better security
* SSR compatibility

---

### Dashboard

Migrated from:

```text
Placeholder content
```

to:

```text
Live database-driven content
```

---

### Layout

Migrated from:

```text
Single layout
```

to:

```text
(auth) route group

(app) route group
```

---

## Fixed

### Authentication

* Redirect loops
* Session race conditions
* Client-side loading flashes

---

### Routing

* Auth pages incorrectly rendering AppShell
* Route group organization issues

---

### Supabase

* Multiple GoTrueClient instances
* Incorrect client initialization pattern

---

## Known Limitations

* Activity feed not paginated
* Activity deduplication not implemented
* Placeholder pages remain:

  * Settings
  * Characters
  * Connections
  * Timeline

---

# [v0.3] - June 2026

## Release Name

Writing Workflow

---

## Added

### Projects

* Project CRUD

### Notes

* Note CRUD

### Dashboard

* Initial dashboard implementation

### Validation

* Project validation schemas
* Note validation schemas

### Services

* Projects service
* Notes service

---

## Outcome

First complete writer workflow established.

Users could:

```text
Login

↓

Create Project

↓

Create Note

↓

View Note

↓

Continue Writing
```

---

# [v0.2] - June 2026

## Release Name

Authentication Foundation

---

## Added

### Supabase Integration

* Database setup
* Authentication setup
* Profile creation trigger

### Security

* Row Level Security
* Protected routes

### User Management

* Registration
* Login
* Logout

---

## Outcome

Secure multi-user platform established.

---

# [v0.1] - June 2026

## Release Name

Project Foundation

---

## Added

### Initial Setup

* Next.js application
* TypeScript configuration
* Tailwind CSS
* shadcn/ui

### Architecture

* Service layer pattern
* Folder structure
* Shared layout
* Route organization

### Development Foundation

* Git repository
* Documentation structure
* Project conventions

---

## Outcome

Scalable development foundation established.

---

# Upcoming

## [v0.5]

Planned:

Context Layer v1

Potential additions:

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions
* Continue Writing Workspace

---

## [v0.6]

Planned:

Connections Layer v1

Potential additions:

* Linked Notes
* Related Projects
* Context References
* Idea Relationships

---

## [v1.0]

Vision:

A complete memory system for writers.

---

End of Changelog
