# Session Architecture Research
## @supabase/ssr Migration Assessment

Date: 24 June 2026
Sprint: 3
Status: Research Only — No Implementation This Sprint

---

## Current Implementation

Auth is handled entirely client-side.

Every protected route lives inside src/app/(app)/layout.tsx.
That layout runs getCurrentUser() on mount and redirects
to /login if no session is found.

### Problems with this approach

1. Flash of content before redirect
2. No server-side session awareness
3. Session lives only in localStorage

---

## What @supabase/ssr Provides

Package: @supabase/ssr

Two client factories:
- createBrowserClient() for Client Components
- createServerClient() for Server Components, Server Actions, proxy.ts

Both use cookies instead of localStorage.

### Benefits

1. Server components can fetch authed data directly
2. proxy.ts can read the session reliably
3. No flash of content
4. Enables future Server Actions

---

## Migration Effort

### What would change

1. Install @supabase/ssr
2. Replace src/lib/supabase/client.ts with createBrowserClient()
3. Create src/lib/supabase/server.ts with createServerClient()
4. Rewrite src/proxy.ts to read session from cookies
5. Update (app)/layout.tsx — remove client-side auth check
6. Update (auth)/layout.tsx — remove client-side auth check

### Estimated effort: 2-4 hours
### Risk: Low

---

## Recommendation

Migrate in Sprint 4.
Current approach works for Sprint 3.

## References

- https://supabase.com/docs/guides/auth/server-side/nextjs
- https://supabase.com/docs/guides/auth/server-side-rendering
