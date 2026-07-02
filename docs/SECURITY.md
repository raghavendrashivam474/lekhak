# Security Policy

## Lekhak

**Version:** v0.6

**Status:** Active Development

**Last Updated:** July 2026

---

# Purpose

This document describes the security practices followed by Lekhak and explains how security vulnerabilities should be reported.

Although Lekhak is currently under active development, security remains an important design consideration.

The project stores personal creative work and therefore treats user data with care.

---

# Supported Versions

The following versions currently receive security updates.

| Version          | Supported |
| ---------------- | :-------: |
| v0.6             |     ✅     |
| v0.5             |     ❌     |
| v0.4             |     ❌     |
| Earlier Versions |     ❌     |

Only the latest development version is actively maintained.

---

# Reporting a Vulnerability

If you discover a security issue, please do **not** open a public GitHub Issue.

Instead, report it privately.

Include as much information as possible:

* Description of the issue
* Steps to reproduce
* Expected behaviour
* Actual behaviour
* Screenshots (if applicable)
* Environment information
* Suggested mitigation (optional)

Reports will be investigated as soon as reasonably possible.

---

# Security Principles

Lekhak follows several security principles.

## Authentication

Authentication is handled through:

```text
Supabase Auth

+

@supabase/ssr
```

Sessions are stored using secure cookies.

Protected pages are validated on the server before rendering.

---

## Authorization

Access control is enforced using PostgreSQL Row Level Security (RLS).

Principle:

```text
A writer may only access their own data.
```

Application logic complements database-level security but does not replace it.

---

## Data Ownership

Every record belongs to a specific authenticated user.

Examples include:

* Projects
* Notes
* Activity
* Relationships

Cross-user access is prevented through ownership checks and RLS policies.

---

## Validation

All user input is validated before reaching the database.

Validation is centralized within:

```text
src/lib/validations/
```

Validation helps protect against malformed or invalid data entering the system.

---

## Database Security

Current database protections include:

* Row Level Security
* Foreign key constraints
* Typed queries
* Server-side authentication
* User ownership enforcement

---

## Client Security

Sensitive operations should always be performed through the Service Layer.

Pages and components should never communicate directly with the database.

Current execution model:

```text
User

↓

Component

↓

Service

↓

Database
```

---

# Current Security Scope

The current version focuses on protecting:

* User authentication
* User authorization
* Project ownership
* Note ownership
* Activity ownership
* Relationship ownership

Future versions may expand security features as the platform evolves.

---

# Future Security Improvements

Potential future enhancements include:

* Rate limiting
* Audit logging
* Account recovery improvements
* Multi-factor authentication
* Session management controls
* Security event monitoring

These features are planned for later stages of development.

---

# Responsible Disclosure

Please allow reasonable time for reported vulnerabilities to be investigated and resolved before public disclosure.

Responsible disclosure helps protect all users while fixes are being developed.

---

# Security Philosophy

Lekhak is built around a simple principle:

> Writers should be able to trust that their creative work remains private, secure, and under their control.

Security decisions should always prioritize user ownership, data integrity, and long-term reliability.

---

*End of Security Policy*
