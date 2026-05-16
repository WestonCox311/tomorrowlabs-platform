# First Session Prompt

This is the prompt to paste into Claude Code at the start of the very first session. It primes Claude Code with what it needs to know without overwhelming it.

---

## The prompt to paste:

```
Hi Claude Code. Welcome to the TomorrowLabs Platform repository.

This is the first session of work on this codebase. The strategic architecture has been designed extensively (see `knowledge-base/`), but no code has been written yet.

Before we begin, please:

1. Read CLAUDE.md carefully — it has the orientation, conventions, and architectural commitments
2. Read docs/CURRENT_TASK.md to see what's currently in progress (nothing yet)
3. Read docs/TASKS.md to see the full task sequence
4. Skim knowledge-base/00-start-here/01-orientation.md for strategic context

Once you've done that, confirm:
- You understand what this project is and what it's not
- You understand the four-layer architecture and the six critical commitments
- You're clear that we're building an admin UI first, scoped minimally
- You know where to look for context when you encounter questions

After your confirmation, propose a plan for Task 01: Project Setup. Then we'll start.

One important note: I (Weston) have already completed the SETUP.md steps. You have access to .env.local with Supabase credentials. The migrations are in migrations/ but have not yet been run against the database.

I value direct, honest engagement. Push back when something seems wrong. Don't validate without evidence. If you don't know something, say so.

Let's build something good together.
```

---

## Why this prompt works

**It tells Claude Code where to look first.** Without this, Claude Code might dive into code without reading the orientation, and would miss the architectural commitments that should shape every line of code.

**It requires explicit confirmation.** Asking Claude Code to confirm understanding catches mismatches early. If it confirms wrong things, you correct before code gets written.

**It scopes the first task explicitly.** "Task 01: Project Setup" is clear and bounded. Not "build the platform."

**It tells Claude Code about the user.** The note about valuing direct engagement and pushback shapes how Claude Code communicates throughout the session.

**It acknowledges what's already done.** Telling Claude Code that SETUP.md is complete prevents it from trying to redo setup work.

## What to do after pasting this

1. Wait for Claude Code's confirmation summary
2. Read what it says it understands. Correct anything that's wrong.
3. Review its proposed plan for Task 01
4. Either approve, refine, or push back on the plan
5. Let it execute

## What to do if the first session goes off track

Common issues and responses:

**Claude Code wants to redesign the architecture.**
Stop. Point at `CLAUDE.md`. The architecture is settled. Engineering decisions only.

**Claude Code wants to skip reading the knowledge base.**
Insist. The strategic context shapes implementation choices. Skipping it produces code that violates commitments.

**Claude Code wants to install too many dependencies.**
Default to minimum. Each dependency is debt. Add when needed, not speculatively.

**Claude Code wants to over-engineer the admin UI.**
Refer to the explicit scope in TASKS.md. "Minimal" was chosen deliberately.

**Claude Code asks questions that the knowledge base answers.**
Point it at the relevant doc. Don't answer the same question twice when documentation exists.

## For subsequent sessions

After the first session, your prompts can be much shorter:

```
Continuing work on Task 02. Last session we completed [X]. Please update CURRENT_TASK.md and proceed.
```

Or:

```
Let's start Task 04 (Authentication). Read docs/TASKS.md for the spec, then propose a plan.
```

The CLAUDE.md gets re-read every session automatically. You don't need to re-orient Claude Code each time — just point at what you want to work on.

---

**Save this prompt somewhere accessible.** You'll only use the full first-session prompt once, but subsequent sessions benefit from clear, scoped requests rather than open-ended ones.
