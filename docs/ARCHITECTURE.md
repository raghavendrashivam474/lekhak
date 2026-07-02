# Architecture

## Lekhak

### System Architecture

**Version:** v0.6

**Status:** Active Development

**Last Updated:** July 2026

---

# Architecture Progress

```text
▶ Part 1 — Foundations
○ Part 2 — System Structure
○ Part 3 — Data Architecture
○ Part 4 — Application Architecture
○ Part 5 — Execution Flow
○ Part 6 — Future Architecture
```

---

# 1. Purpose

This document explains the technical architecture of Lekhak.

It is intended for developers who need to:

* Understand how the system is organized
* Add new capabilities safely
* Debug existing functionality
* Refactor without breaking architecture
* Contribute while maintaining consistency

Unlike implementation guides, this document focuses on **why the architecture exists**, **how the major systems interact**, and **which architectural principles every contributor should follow**.

For product reasoning and long-term vision, refer to:

```text
docs/PRODUCT_VISION.md
```

For planned evolution of the product, refer to:

```text
docs/ROADMAP.md
```

---

# 2. Scope

This document covers:

* Overall system architecture
* Architectural principles
* Layered system design
* Capability evolution
* Information flow
* Technical decision making
* Future architectural direction

Implementation details such as component props, API signatures, SQL scripts, or individual algorithms are intentionally documented elsewhere.

The purpose of this document is to explain the structure of the system rather than every line of code.

---

# 3. Architectural Philosophy

Lekhak is not being developed as a collection of independent features.

Instead, it is built around a small number of architectural principles that remain consistent as the product evolves.

Every new sprint should strengthen the existing architecture rather than replace it.

This philosophy allows the project to scale while remaining understandable to both current and future contributors.

The architecture is guided by one fundamental belief:

> **Software should preserve understanding before it adds functionality.**

Every architectural decision is evaluated against this principle.

---

# 4. Design Principles

The following principles govern every technical decision within Lekhak.

---

## 4.1 Separation of Concerns

Each architectural layer has a single responsibility.

Presentation should display information.

Services should contain business logic.

The database should store information.

Responsibilities should never overlap.

Correct:

```text
User

↓

Page

↓

Service

↓

Database
```

Incorrect:

```text
User

↓

Page

↓

Database
```

Pages should never communicate directly with Supabase.

---

## 4.2 Simplicity Before Complexity

Lekhak intentionally avoids unnecessary infrastructure.

The current architecture does **not** include:

```text
Microservices

Redis

Kafka

Message Queues

Event Buses

CQRS

Distributed Caching
```

These technologies solve problems that the project does not currently have.

Complexity should only be introduced after a clear architectural need emerges.

---

## 4.3 Progressive Evolution

The architecture is designed to grow gradually.

Each sprint extends the previous one.

Large rewrites should be avoided whenever possible.

For example:

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
```

Each capability builds directly upon the previous capability.

Nothing is discarded.

---

## 4.4 Single Source of Truth

Business rules should exist in one location only.

Examples:

Validation belongs in:

```text
src/lib/validations
```

Business logic belongs in:

```text
src/services
```

Shared models belong in:

```text
src/types
```

Duplicating logic across multiple pages or components should always be avoided.

---

## 4.5 Explicit Knowledge

Where possible, Lekhak stores knowledge explicitly instead of reconstructing it later.

Examples include:

* Activity history
* Project intent
* Note relationships
* Question status
* Goal support

Although this introduces additional data, it significantly simplifies future reasoning and visualization.

---

## 4.6 Human-Centered Architecture

Every architectural decision should ultimately reduce cognitive load for writers.

The software exists to support creativity.

The architecture should therefore prioritize:

* clarity
* maintainability
* continuity
* understanding

over unnecessary technical sophistication.

---

# 5. High-Level Architecture

Lekhak currently follows a layered service-oriented architecture.

```text
                     User

                      │

                      ▼

             Presentation Layer

                      │

                      ▼

             Application Layer

                      │

                      ▼

               Service Layer

                      │

                      ▼

            Supabase Client Layer

                      │

                      ▼

             PostgreSQL Database
```

Each layer has a clearly defined responsibility.

Communication always flows downward through the layers.

No layer should bypass another.

---

# 6. Architectural Layers

---

## Presentation Layer

Responsible for:

* Pages
* Components
* Layouts
* User interaction

Responsibilities:

* Display information
* Handle user events
* Invoke services

Should never:

* Execute business logic
* Access the database directly
* Build SQL queries

---

## Application Layer

Responsible for composing the user experience.

This layer coordinates multiple components into complete screens.

Examples include:

* Dashboard
* Project Detail
* Notes
* Settings

The Application Layer should remain thin.

Business decisions belong elsewhere.

---

## Service Layer

The Service Layer is the heart of Lekhak.

It is responsible for:

* Business logic
* Validation
* Database communication
* Activity recording
* Relationship management
* Intent updates

Every mutation passes through this layer.

This guarantees consistent behaviour across the application.

---

## Data Layer

Responsible for persistent storage.

Current implementation:

```text
Supabase

↓

PostgreSQL
```

Responsibilities include:

* Storage
* Authentication
* Security
* Row Level Security
* Query execution

The Data Layer should remain unaware of presentation logic.

---

# 7. Capability-Based Architecture

Unlike traditional CRUD applications, Lekhak evolves through capabilities.

Each capability expands the application's understanding of the writer.

Current progression:

```text
Sprint 1

Infrastructure

↓

Sprint 2

Writing Workflow

↓

Sprint 3

Content Management

↓

Sprint 4

Memory

↓

Sprint 5

Intent

↓

Sprint 6

Relationships
```

Rather than replacing existing systems, each sprint introduces a new layer of understanding.

This allows the application to mature without architectural disruption.

---

# 8. Current Capability Stack

As of Version v0.6, Lekhak provides six architectural capabilities.

---

## Infrastructure

Provides:

* Routing
* Authentication
* Shared layouts
* Type system
* Validation
* Project structure

---

## Writing

Provides:

* Projects
* Notes
* CRUD operations

---

## Memory

Provides:

* Activity logging
* Resume context
* Timeline
* Recent activity

---

## Intent

Provides:

* Project Goal
* Current Focus
* Next Writing Step
* Open Questions

---

## Relationships

Provides:

* Related Notes
* Note References
* Goal Support
* Focus Support
* Question Relationships
* Note Categories

---

## Foundation for Intelligence

Although Writer Intelligence has not yet been implemented, the existing architecture now preserves sufficient information to support future reasoning.

The application now understands:

```text
Projects

↓

Intent

↓

Notes

↓

Relationships

↓

Activity
```

This knowledge model forms the foundation for future intelligence features.

---

# 9. Architectural Goals

The architecture is designed to satisfy four long-term goals.

---

## Scalability

Future capabilities should extend existing systems rather than replace them.

---

## Maintainability

New contributors should quickly understand where new functionality belongs.

---

## Predictability

Every feature should follow the same architectural patterns.

Developers should rarely need to invent new patterns.

---

## Continuity

Future versions of Lekhak should continue evolving without major architectural rewrites.

This allows the product to mature organically while preserving stability.

---

# Part 2 — System Structure

---

# 10. Introduction

Part 1 established the architectural philosophy of Lekhak and the principles that guide every engineering decision.

This section explains how those principles are translated into the physical structure of the application.

Rather than discussing business capabilities, this section focuses on **how the codebase is organized**, **why each directory exists**, and **how responsibilities are distributed across the project**.

A well-structured codebase is essential for long-term maintainability.

Every folder should communicate ownership.

Every file should have a single responsibility.

Every contributor should know exactly where new functionality belongs.

---

# 11. Project Structure

Current project structure:

```text
lekhak/

├── docs/
├── public/
├── scripts/
├── src/
│
├── app/
├── components/
├── hooks/
├── lib/
├── services/
├── styles/
├── types/
│
├── .env.local
├── package.json
├── tsconfig.json
└── next.config.ts
```

The repository intentionally separates documentation, tooling, application code and assets.

This prevents unrelated concerns from becoming mixed together.

---

# 12. Top-Level Directory Responsibilities

---

## docs/

Purpose:

Project documentation.

Contains:

```text
README

Architecture

Roadmap

Product Vision

Design Philosophy

3D Philosophy

Sprint Reports

Handover

Contributing
```

No production code belongs here.

---

## public/

Purpose:

Static assets.

Examples:

```text
Images

Icons

Fonts

Logos

Static files
```

Files inside this directory are served directly by Next.js.

---

## scripts/

Purpose:

Development utilities.

Examples:

```text
Seed scripts

Migration helpers

Maintenance scripts
```

Scripts should never contain business logic.

They exist only to support development.

---

## src/

Purpose:

Entire application source code.

Everything required to build the application lives here.

All future development should occur inside this directory.

---

# 13. Source Directory Organization

Current structure:

```text
src/

app/
components/
hooks/
lib/
services/
styles/
types/
```

Each directory owns one architectural concern.

Responsibilities should never overlap.

---

# 14. app/

Purpose:

Application routing.

Uses:

```text
Next.js App Router
```

Responsibilities:

* Route definitions
* Layouts
* Page composition
* Navigation

Should not contain:

* Business logic
* Database queries
* Validation logic

Pages should remain thin.

---

# 15. App Router Architecture

Current routing structure:

```text
app/

├── (auth)/
│
│   ├── login/
│   └── signup/
│
├── (app)/
│
│   ├── dashboard/
│   ├── projects/
│   │
│   ├── projects/[id]/
│   │
│   ├── projects/[id]/notes/[noteId]/
│   │
│   ├── notes/
│   ├── timeline/
│   ├── settings/
│   ├── characters/
│   └── connections/
│
├── layout.tsx
└── page.tsx
```

Route Groups are used to separate authenticated and unauthenticated experiences without affecting the URL structure.

---

# 16. Route Groups

---

## (auth)

Purpose:

Public authentication pages.

Contains:

```text
Login

Signup
```

Characteristics:

* No Sidebar
* No Top Navigation
* Minimal layout
* Accessible without authentication

These pages should remain focused exclusively on user authentication.

---

## (app)

Purpose:

Protected application.

Contains:

```text
Dashboard

Projects

Notes

Timeline

Characters

Connections

Settings
```

Characteristics:

* Wrapped by AppShell
* Sidebar navigation
* Top Navigation
* Requires authenticated session

All core writing functionality exists inside this route group.

---

# 17. Layout Hierarchy

The application currently follows the following layout structure:

```text
Root Layout

↓

Route Group Layout

↓

AppShell

↓

Sidebar

Top Navigation

↓

Page

↓

Components
```

This hierarchy ensures that shared UI elements remain consistent across the application.

Pages focus only on their own content.

---

# 18. Component Architecture

Purpose:

Reusable user interface.

Directory:

```text
src/components
```

Current organization:

```text
components/

layout/

projects/

notes/

ui/
```

Each directory groups components by responsibility rather than by page.

This improves discoverability and reuse.

---

## layout/

Contains shared structural components.

Examples:

```text
AppShell

Sidebar

Top Navigation
```

These components define the overall user experience.

---

## projects/

Contains project-specific components.

Examples:

```text
CreateProjectDialog

EditProjectDialog

IntentPanel
```

Only components directly related to projects belong here.

---

## notes/

Contains note-specific components.

Examples:

```text
CreateNoteDialog

EditNoteDialog
```

Future note features should continue using this structure.

---

## ui/

Contains reusable UI primitives.

Examples:

```text
Button

Input

Textarea

Dialog

Dropdown

Card
```

These components remain independent of business logic.

---

# 19. hooks/

Purpose:

Reusable React hooks.

Directory:

```text
src/hooks
```

Responsibilities:

* Shared stateful logic
* Reusable client-side behaviour
* Custom React hooks

Hooks should not perform business operations.

Business rules belong inside services.

---

# 20. lib/

Purpose:

Shared utilities.

Current organization:

```text
lib/

supabase/

validations/

constants/

utils/
```

Responsibilities include:

* Utility functions
* Validation schemas
* Shared constants
* Supabase client configuration

This directory should remain framework-independent whenever possible.

---

# 21. services/

Purpose:

Business logic.

This is the most important directory within the application.

Every database operation passes through this layer.

Current services:

```text
Auth

Projects

Notes

Activity

Relationships
```

Responsibilities:

* Business rules
* Validation
* Database communication
* Activity logging
* Relationship management

Pages must never bypass this layer.

---

# 22. types/

Purpose:

Shared application models.

Examples:

```text
Project

Note

Activity

Relationship

Question

Intent
```

Every shared interface should exist here.

Duplicated interfaces should be avoided.

---

# 23. styles/

Purpose:

Global styling.

Contains:

```text
Tailwind configuration

Global styles

Shared CSS
```

Component-specific styling should remain close to the component whenever practical.

---

# 24. Authentication Architecture

Authentication uses:

```text
Supabase Auth

+

@supabase/ssr
```

Sessions are stored using secure cookies.

Authentication occurs before protected pages render.

Current flow:

```text
Request

↓

proxy.ts

↓

Read Session Cookie

↓

Authenticated?

↓

Yes

↓

Continue

↓

Render

──────────────

No

↓

Redirect

↓

Login
```

This eliminates flashes of unauthenticated content while supporting Server Components.

---

# 25. Navigation Architecture

Primary navigation follows a workspace-first design.

```text
Dashboard

↓

Projects

↓

Project

↓

Intent

↓

Notes

↓

Relationships

↓

Timeline
```

Navigation should encourage continuity rather than exploration.

Writers should always understand where they are and how to return to previous work.

---

# 26. Current Folder Ownership

Every major directory owns a distinct concern.

```text
app

↓

Routing

components

↓

Presentation

services

↓

Business Logic

lib

↓

Utilities

types

↓

Shared Models

hooks

↓

Reusable Client Logic

styles

↓

Appearance
```

Maintaining these boundaries is critical for long-term maintainability.

Contributors should avoid introducing cross-directory responsibilities.

---

# Part 3 — Data Architecture

---

# 28. Introduction

The previous section described **where** the application is organized.

This section explains **what information the application stores**, **how that information is structured**, and **how different pieces of knowledge relate to one another**.

The database is more than persistent storage.

It represents Lekhak's understanding of a writer's creative work.

Every capability introduced since Sprint 1 has expanded this understanding.

---

# 29. Data Philosophy

Lekhak follows a **Knowledge-Oriented Data Model**.

Instead of storing only documents, the system stores the knowledge surrounding those documents.

This includes:

* Projects
* Notes
* Intent
* Activity
* Relationships

The application should understand not only **what exists**, but also:

* why it exists
* how it evolved
* what it relates to

---

# 30. Data Evolution

The data model has evolved alongside the product.

Each sprint introduced new entities or enriched existing ones.

```text
Sprint 1

Infrastructure

↓

Sprint 2

Projects
Notes

↓

Sprint 3

Content Management

↓

Sprint 4

Activity Logs

↓

Sprint 5

Intent

↓

Sprint 6

Relationships
```

Notice that no entity has ever been replaced.

Each milestone extends the existing model.

This approach minimizes migration complexity while preserving long-term consistency.

---

# 31. Current Knowledge Model

As of Version v0.6, Lekhak understands the following information hierarchy.

```text
Writer

↓

Projects

↓

Intent

↓

Questions

↓

Notes

↓

Relationships

↓

Activity
```

Each level enriches the previous one.

The application no longer stores isolated information.

Instead, it gradually builds a structured knowledge model around every writing project.

---

# 32. Core Entities

The following entities form the foundation of the application.

```text
Profile

Project

Note

Activity

Relationship
```

Each entity has a clearly defined responsibility.

Responsibilities should never overlap.

---

## Profile

Represents an authenticated writer.

Owns:

```text
Projects

Activity

Relationships
```

A Profile never directly owns notes.

Notes belong to Projects.

---

## Project

The Project is the primary aggregate within Lekhak.

Every creative asset ultimately belongs to a project.

A project owns:

```text
Intent

Notes

Relationships

Activity
```

Future capabilities should continue extending the Project rather than introducing competing root entities.

---

## Note

A Note represents an individual unit of creative work.

Examples include:

```text
Scene

Outline

Research

Dialogue

Idea

Character Notes

Revision
```

Notes are intentionally lightweight.

Meaning is created through relationships rather than note complexity.

---

## Activity

Activity represents historical events.

Examples:

```text
Project Created

Project Updated

Note Created

Note Updated

Relationship Created

Question Answered
```

Activities are immutable.

They preserve history rather than current state.

---

## Relationship

Relationships represent explicit connections between creative assets.

Unlike Activity, relationships describe present knowledge rather than historical events.

Relationships remain editable.

Activity remains permanent.

---

# 33. Database Tables

Current database consists of the following primary tables.

```text
profiles

projects

notes

activity_logs

relationship tables
```

Additional supporting tables may be introduced as future capabilities require them.

---

## profiles

Purpose

Stores writer information.

Typical fields include:

```text
id

email

full_name

avatar_url

created_at
```

Every authenticated writer has exactly one profile.

---

## projects

Purpose

Stores writing projects.

Current responsibilities include:

```text
Project Information

Intent

Ownership

Lifecycle
```

Typical fields include:

```text
id

user_id

title

description

goal

current_focus

next_step

created_at

updated_at
```

Future project capabilities should extend this table rather than introducing duplicate project metadata elsewhere.

---

## notes

Purpose

Stores creative content.

Typical fields include:

```text
id

project_id

title

content

category

created_at

updated_at
```

Each note belongs to exactly one project.

---

## activity_logs

Purpose

Stores historical events.

Typical fields include:

```text
id

project_id

entity_type

entity_id

action

metadata

created_at
```

Activity records are append-only.

Existing history should never be modified.

---

## Relationship Tables

Sprint 6 introduces explicit relationship storage.

Examples include:

```text
Note References

Related Notes

Goal Support

Focus Support

Question Relationships
```

Rather than inferring connections later, Lekhak stores them directly.

This greatly simplifies future reasoning and visualization.

---

# 34. Entity Relationships

Current ownership model:

```text
Profile

│

├──────── Projects

│

└──────── Activity

Projects

│

├──────── Notes

├──────── Intent

├──────── Relationships

└──────── Activity
```

Every entity has one clear owner.

Ownership ambiguity should always be avoided.

---

# 35. Relationship Model

Relationships are first-class entities.

Current relationship types include:

```text
Reference

Related

Supports Goal

Supports Focus

Answers Question

Required By Next Step
```

Each relationship represents a semantic connection.

These are intentionally stored rather than calculated dynamically.

---

# 36. Data Integrity

The architecture follows several integrity principles.

---

## Explicit Ownership

Every entity belongs to exactly one parent.

Examples:

```text
Project

↓

Note
```

Never:

```text
Note

↓

Multiple Projects
```

---

## Immutable History

Activity should never be edited.

Historical records preserve the evolution of creative work.

Corrections should create new activity rather than modifying previous entries.

---

## Normalization

Information should exist only once.

Example:

Project title belongs inside:

```text
projects
```

It should never be duplicated inside notes or activity unless stored as immutable historical metadata.

---

## Referential Integrity

Relationships should always reference valid entities.

Orphaned records should be prevented through foreign keys and application-level validation.

---

# 37. Row Level Security

All primary tables enforce Row Level Security.

Principle:

```text
A writer may only access their own creative work.
```

Authentication alone is not considered sufficient protection.

Every query relies upon RLS policies enforced by PostgreSQL.

This ensures security regardless of the client making the request.

---

# 38. Index Strategy

Indexes exist to support frequent access patterns.

Current indexing focuses on:

```text
User Ownership

Project Lookup

Recent Activity

Relationships

Updated Projects
```

As the application grows, additional indexes should only be introduced after identifying real performance bottlenecks.

Premature optimization should be avoided.

---

# 39. Future Data Evolution

The current model intentionally leaves room for future capabilities.

Planned additions include:

```text
Writer Intelligence

Knowledge Graph

Creative Analytics

Spatial Memory
```

These capabilities should extend existing entities rather than introducing competing data models.

Maintaining continuity is preferred over architectural reinvention.

---
# Part 4 — Application Architecture

---

# 40. Introduction

The previous section explained **what information Lekhak stores**.

This section explains **how that information is manipulated**.

Data alone is not sufficient.

The application requires a consistent mechanism for:

* creating data
* validating data
* updating data
* recording history
* maintaining relationships
* enforcing business rules

This responsibility belongs entirely to the **Application Layer**, with the **Service Layer** acting as its core.

---

# 41. Application Philosophy

The Application Layer exists to translate user actions into meaningful operations.

It should never expose database implementation details to the user interface.

Instead, every user action follows the same architectural path.

```text
User

↓

Component

↓

Service

↓

Validation

↓

Database

↓

Activity

↓

Response

↓

Component
```

This predictable execution model keeps behaviour consistent throughout the application.

---

# 42. Service Layer

The Service Layer is the heart of Lekhak.

Directory:

```text
src/services/
```

Every operation that modifies or retrieves application data passes through this layer.

No exceptions should exist.

Responsibilities include:

* Business rules
* Database communication
* Validation orchestration
* Activity logging
* Relationship updates
* Error handling

The Service Layer exists to isolate business logic from presentation logic.

---

# 43. Current Services

Current architecture consists of the following services.

```text
Authentication

Projects

Notes

Activity

Relationships
```

Each service owns one business domain.

Responsibilities should never overlap.

---

# 44. Authentication Service

Directory

```text
src/services/auth/
```

Purpose

Manage authentication-related operations.

Typical responsibilities:

```text
Sign Up

Sign In

Sign Out

Get Current User

Refresh Session
```

Authentication logic should remain isolated from the remainder of the application.

No other service should directly manipulate authentication state.

---

# 45. Projects Service

Directory

```text
src/services/projects/
```

Purpose

Manage the complete lifecycle of writing projects.

Responsibilities include:

```text
Create Project

Update Project

Delete Project

Retrieve Projects

Retrieve Project Details
```

Following Sprint 5, the service also manages project intent.

Examples:

```text
Goal

Current Focus

Next Writing Step

Open Questions
```

Projects remain the primary aggregate of the application.

Every future capability should extend the Projects Service before introducing new root services.

---

# 46. Notes Service

Directory

```text
src/services/notes/
```

Purpose

Manage creative content.

Responsibilities include:

```text
Create Note

Update Note

Delete Note

Retrieve Notes

Retrieve Note Details
```

Notes intentionally remain lightweight.

Complex behaviour is achieved through relationships rather than increasingly complex note objects.

---

# 47. Activity Service

Directory

```text
src/services/activity/
```

Purpose

Preserve creative history.

Responsibilities include:

```text
Record Activity

Retrieve Activity Feed

Retrieve Project Timeline

Generate Resume Context
```

Unlike other services, the Activity Service primarily records historical information rather than current state.

Activity records should never be edited.

---

# 48. Relationship Service

Directory

```text
src/services/relationships/
```

Purpose

Manage semantic relationships between creative assets.

Responsibilities include:

```text
Create Relationships

Delete Relationships

Retrieve Relationships

Update Relationship Metadata

Maintain Relationship Integrity
```

Examples of supported relationships:

```text
Related Notes

Note References

Goal Support

Focus Support

Question Relationships

Next Step Dependencies
```

Relationships form the knowledge layer of the application.

---

# 49. Validation Layer

Validation exists independently from services.

Location:

```text
src/lib/validations/
```

Responsibilities:

* Input validation
* Type refinement
* Business constraints

Current schemas include:

```text
Project

Note

Intent

Authentication
```

Future schemas should continue to reside in this directory.

Validation should never be duplicated inside components.

---

# 50. Type System

Shared application models live in:

```text
src/types/
```

Examples:

```text
Project

Note

Activity

Relationship

Question

Intent
```

These types provide a single source of truth for the application.

Services, components and pages should import shared types rather than redefining interfaces.

---

# 51. Utility Layer

Location:

```text
src/lib/
```

Contains shared utilities used across multiple architectural layers.

Examples:

```text
Supabase Client

Constants

Utilities

Validation

Helper Functions
```

Utilities should remain stateless whenever possible.

Business logic belongs inside services.

---

# 52. Component Responsibilities

Components exist solely to present information.

Responsibilities include:

* Rendering data
* Collecting user input
* Triggering actions
* Displaying loading states
* Displaying errors

Components should never:

* Build queries
* Communicate directly with Supabase
* Contain business rules

Presentation should remain independent from application logic.

---

# 53. Page Responsibilities

Pages compose multiple components into complete user experiences.

Example:

```text
Project Page

↓

Project Details

↓

Intent Panel

↓

Notes

↓

Relationships

↓

Timeline
```

Pages coordinate.

They do not implement business behaviour.

---

# 54. Activity Architecture

Activity recording follows a fire-and-forget model.

Execution flow:

```text
Mutation

↓

Database Success

↓

Record Activity

↓

Return Response
```

If activity recording fails, the primary operation should still succeed.

The writer's work always takes precedence over historical logging.

---

# 55. Intent Architecture

Intent represents the writer's current thinking.

Current intent model:

```text
Goal

↓

Current Focus

↓

Next Writing Step

↓

Open Questions
```

Intent is mutable.

Unlike activity, it reflects the writer's present understanding rather than historical events.

Future capabilities should enrich this model rather than replace it.

---

# 56. Relationship Architecture

Relationships represent semantic knowledge.

Current relationship categories include:

```text
Reference

Related

Supports Goal

Supports Focus

Answers Question

Required By Next Step
```

Unlike Activity, relationships describe current understanding rather than chronological events.

Relationships may evolve over time as the project evolves.

---

# 57. Error Handling Strategy

Current architecture centralizes operational failures inside services.

General flow:

```text
Database

↓

Service

↓

Structured Error

↓

Page

↓

User Interface
```

Raw database errors should never be exposed directly to users.

Pages should display meaningful, actionable feedback.

---

# 58. State Management

Current architecture intentionally relies primarily on React's native capabilities.

State exists at three levels.

```text
Component State

↓

Page State

↓

Persistent Database State
```

Global client-side state management libraries are intentionally avoided until justified by application complexity.

---

# 59. Extensibility Principles

Every future capability should satisfy the following rules.

A new capability should:

* reuse existing services whenever practical
* extend existing entities before creating new ones
* preserve architectural consistency
* avoid unnecessary abstractions

Large-scale refactoring should remain the exception rather than the norm.

#
# Part 5 — Execution Flow

---

# 60. Introduction

The previous sections established:

* Why the architecture exists
* How the project is organized
* How data is structured
* How business logic is implemented

This section explains **how all of those pieces work together during runtime**.

Rather than describing individual services or database tables, this section follows information as it moves through the system.

Understanding execution flow is essential before introducing new capabilities.

Contributors should understand how an operation travels through the architecture before modifying any existing functionality.

---

# 61. End-to-End Request Lifecycle

Every interaction inside Lekhak follows a predictable lifecycle.

```text
User

↓

User Interface

↓

Component Event

↓

Validation

↓

Service

↓

Supabase

↓

PostgreSQL

↓

Service

↓

Activity Logging

↓

Response

↓

Component

↓

Updated User Interface
```

Every successful feature should follow this lifecycle.

Consistency reduces maintenance cost and makes debugging significantly easier.

---

# 62. Read Operations

Read operations retrieve information without modifying application state.

Examples include:

```text
Dashboard

Projects List

Project Details

Notes

Activity Feed

Relationships
```

Typical flow:

```text
User Opens Page

↓

Server Component

↓

Service

↓

Supabase Query

↓

PostgreSQL

↓

Result Returned

↓

Component Rendered
```

Read operations should never generate activity records.

---

# 63. Write Operations

Write operations modify persistent data.

Examples include:

```text
Create Project

Update Project

Delete Project

Create Note

Update Note

Delete Note

Create Relationship

Delete Relationship
```

Every write operation follows the same execution pipeline.

```text
User Action

↓

Validation

↓

Service

↓

Database Mutation

↓

Activity Recorded

↓

Response Returned

↓

Interface Updated
```

Maintaining a consistent execution pattern simplifies future development.

---

# 64. Validation Flow

Validation occurs before any database operation.

Execution order:

```text
User Input

↓

Validation Schema

↓

Valid?

↓

Yes

↓

Service

──────────────

No

↓

Return Validation Errors
```

Invalid data should never reach the Service Layer.

This keeps business logic focused solely on application behaviour.

---

# 65. Project Creation Flow

Creating a project illustrates the complete lifecycle.

```text
Create Project

↓

Validate Input

↓

Projects Service

↓

Insert Project

↓

Successful?

↓

Yes

↓

Log Activity

↓

Return Project

↓

Refresh Interface
```

The activity log is created only after the database operation succeeds.

---

# 66. Note Creation Flow

Notes follow the same architectural pattern.

```text
Create Note

↓

Validate

↓

Notes Service

↓

Insert Note

↓

Update Project Timestamp

↓

Record Activity

↓

Return Note

↓

Refresh Project
```

Updating the parent project's activity timestamp ensures accurate "Last Active" information.

---

# 67. Intent Update Flow

Intent is treated differently from standard content.

Rather than creating new entities, intent updates enrich the existing project.

Execution flow:

```text
Edit Intent

↓

Validate

↓

Projects Service

↓

Update Project

↓

Record Activity

↓

Refresh Intent Panel
```

Intent always reflects the current state of the writer's thinking.

Previous values are intentionally not preserved within the project itself.

Historical awareness is delegated to the Activity Layer.

---

# 68. Relationship Creation Flow

Relationships connect existing information.

They never replace existing content.

```text
Select Source

↓

Select Target

↓

Choose Relationship Type

↓

Validate

↓

Relationship Service

↓

Store Relationship

↓

Record Activity

↓

Refresh Connections
```

Relationships strengthen the application's understanding of creative work.

---

# 69. Authentication Flow

Authentication is performed before protected pages are rendered.

```text
Browser Request

↓

Cookies

↓

proxy.ts

↓

Supabase SSR

↓

Session Exists?

↓

Yes

↓

Continue

──────────────

No

↓

Redirect Login
```

Because authentication occurs on the server, protected content never renders for unauthenticated users.

---

# 70. Activity Flow

The Activity Layer observes every meaningful mutation.

```text
Successful Mutation

↓

Activity Service

↓

Activity Log

↓

Dashboard

↓

Timeline

↓

Resume Context
```

Activity acts as the historical memory of the application.

Business functionality should never depend upon activity recording succeeding.

---

# 71. Resume Context Generation

Resume Context combines multiple information sources into a concise workspace summary.

Current inputs include:

```text
Project

↓

Activity

↓

Intent

↓

Recent Notes

↓

Relationships
```

The generated context answers four questions:

```text
Where did I stop?

What changed?

Why was I working?

What should I do next?
```

This represents one of the defining capabilities of Lekhak.

---

# 72. Component Communication

Components communicate through a top-down hierarchy.

```text
Page

↓

Feature Component

↓

Shared Component

↓

UI Primitive
```

Information flows downward.

Events flow upward.

Business logic remains inside services.

---

# 73. Error Propagation

Errors should travel through the architecture in a controlled manner.

```text
Database

↓

Service

↓

Structured Error

↓

Page

↓

Component

↓

User Feedback
```

Unexpected exceptions should never surface directly in the interface.

Every layer should translate errors into forms appropriate for the next layer.

---

# 74. Performance Considerations

Current architecture favors clarity over premature optimization.

Primary optimization strategies include:

```text
Parallel Queries

Server Components

SSR Authentication

Indexed Queries

Reusable Services
```

Caching, background processing and advanced optimization techniques should only be introduced when justified by measurable performance requirements.

---

# 75. Scalability Strategy

Lekhak is designed to scale through extension rather than replacement.

Future capabilities should reuse existing architectural layers.

Examples:

```text
Memory

↓

Intent

↓

Relationships

↓

Intelligence
```

Each capability should consume existing knowledge instead of introducing isolated systems.

This approach minimizes architectural fragmentation.

---

# 76. Architectural Decisions

Several important engineering decisions shape the current implementation.

---

## Why Server Components?

Benefits:

```text
Reduced Client JavaScript

Improved Performance

Secure Data Access

Simpler Data Fetching
```

---

## Why Supabase?

Benefits:

```text
Authentication

PostgreSQL

Realtime Support

RLS

Developer Productivity
```

---

## Why Service-Oriented Design?

Benefits:

```text
Reusable Logic

Centralized Business Rules

Simpler Testing

Cleaner Components
```

---

## Why Progressive Capability Layers?

Rather than building isolated features, Lekhak grows by accumulating understanding.

Every new sprint enriches existing knowledge.

This creates a coherent product rather than a collection of unrelated functionality.

---

# 77. Development Guidelines

Every contribution should follow these principles.

Before implementing a feature, ask:

```text
Does it belong inside an existing service?

Can an existing entity be extended?

Does it preserve architectural consistency?

Does it reduce cognitive load for writers?
```

If the answer is "no," reconsider the design before implementation.

Maintaining consistency is more valuable than introducing clever abstractions.
# Part 6 — Future Architecture

---

# 78. Introduction

The previous sections described the current architecture of Lekhak.

This final section looks beyond the present implementation.

Rather than defining immediate features, it establishes the architectural direction that future versions of Lekhak should follow.

Architectural consistency is more important than rapid feature growth.

Every future capability should extend the existing system instead of introducing parallel architectures.

---

# 79. Evolution Strategy

Lekhak is intentionally being developed through successive capability layers.

Each layer increases the application's understanding of the writer.

```text
Writing

↓

Memory

↓

Intent

↓

Relationships

↓

Intelligence

↓

Creative Operating System
```

Every layer depends upon the layers before it.

Future contributors should preserve this progression.

---

# 80. Architectural Growth Model

The system currently understands:

```text
Projects

↓

Notes

↓

Intent

↓

Relationships

↓

Activity
```

Future development should increase understanding rather than simply increasing stored information.

The objective is not to collect more data.

The objective is to produce more meaningful knowledge.

---

# 81. Writer Intelligence

The next major architectural capability is Writer Intelligence.

Unlike traditional AI assistants, Writer Intelligence is intended to reason using information already present inside Lekhak.

Potential capabilities include:

```text
Writing Patterns

Creative Momentum

Dormant Projects

Revision Frequency

Unanswered Questions

Project Health

Writing Sessions

Creative Consistency
```

These insights should be generated from existing knowledge rather than requiring additional manual input.

---

# 82. Knowledge Graph

Relationships created throughout the application naturally evolve into a knowledge graph.

Conceptually:

```text
Project

↓

Intent

↓

Questions

↓

Notes

↓

Relationships

↓

Knowledge Graph
```

The graph should not exist as a separate system.

It should emerge naturally from the application's existing data.

---

# 83. Visualization Layer

Visualization should never become the primary interface.

Instead, it should help writers understand existing information more effectively.

Possible visualizations include:

```text
Relationship Maps

Project Networks

Question Trees

Idea Clusters

Creative Timelines

Memory Maps
```

Visualization should always represent existing knowledge.

It should never become decorative.

---

# 84. Three-Dimensional Interfaces

Three-dimensional interfaces are intentionally deferred until the underlying knowledge model becomes sufficiently rich.

Current priorities remain:

```text
Knowledge

↓

Understanding

↓

Visualization
```

Rather than:

```text
Visual Effects

↓

Meaning
```

Possible future uses include:

* Spatial memory navigation
* Relationship constellations
* Project ecosystems
* Story worlds
* Knowledge landscapes

Three-dimensional interfaces should improve comprehension rather than simply improving appearance.

---

# 85. Creative Operating System

The long-term vision extends beyond note-taking.

Eventually Lekhak should become a unified creative workspace.

Potential capabilities include:

```text
Characters

World Building

Research

References

Story Structure

Creative Sessions

Writing Analytics

Publishing Preparation
```

Every future capability should integrate into the existing architectural model.

Separate disconnected modules should be avoided.

---

# 86. Architectural Stability

One of the primary design goals is architectural longevity.

Future versions should avoid major rewrites.

Instead:

```text
Extend

↓

Refine

↓

Strengthen
```

rather than:

```text
Replace

↓

Rewrite

↓

Restart
```

Architectural stability reduces technical debt while making long-term maintenance significantly easier.

---

# 87. Development Philosophy

When adding a new capability, contributors should first ask:

```text
Can this extend an existing entity?

Can an existing service own this behaviour?

Can existing relationships express this concept?

Can existing architecture support this feature?
```

Only when the answer is "no" should new architectural structures be introduced.

---

# 88. Engineering Principles

Future development should continue following these principles.

---

## Simplicity

Prefer understandable solutions over clever ones.

---

## Consistency

Follow existing architectural patterns before introducing new ones.

---

## Maintainability

Optimize for developers maintaining the project years from now.

---

## Extensibility

Design every capability so future capabilities can build upon it.

---

## Human-Centered Design

Technology should reduce cognitive load rather than increase it.

The architecture ultimately exists to support creative work.

---

# 89. Success Criteria

The architecture should eventually allow a writer to answer the following questions immediately after opening Lekhak.

```text
What am I building?

Why am I building it?

What changed?

What should I work on next?

Which ideas are connected?

What remains unresolved?

How has this project evolved?
```

If the architecture can answer these questions naturally, it is fulfilling its purpose.

---

# 90. Final Summary

Lekhak is intentionally evolving through a series of architectural capabilities.

```text
Infrastructure

↓

Writing Workflow

↓

Memory

↓

Intent

↓

Relationships

↓

Intelligence

↓

Creative Operating System
```

Each capability enriches the previous one.

Nothing is discarded.

Nothing is rebuilt unnecessarily.

The result is an architecture that grows organically while preserving continuity, maintainability, and clarity.

---

# Architecture Motto

> Store more than documents.
>
> Preserve more than history.
>
> Understand more than information.

Build systems that remember.

Build systems that understand.

Build systems that grow alongside their users.

---

**End of Architecture Document**


