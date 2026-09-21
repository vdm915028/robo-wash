# RoboWash — agent guide

Demo web app for a chain of automated car washes in Saint Petersburg: a mobile-first React client and an ASP.NET
Core API over Postgres, deployed as two Cloud Run services.

Scope is deliberately narrow. Read "Что намеренно не делаем" in README.md before proposing anything: no auth
(device id in localStorage), no real payment, no equipment telemetry (the wash is a 5-second client-side
countdown), no bonuses.

## Where the rules live

This file holds what every task needs. The rest loads only when the work reaches it:

- `.claude/rules/backend.md` — C#, EF Core, the schema. Loads when a file under `src/RoboWash.Api/`,
  `src/RoboWash.xUnit/` or `db/` is read.
- `.claude/rules/client.md` — React, TypeScript, Tailwind, the map. Loads when a file under
  `src/robo-wash-react/` is read.
- `.claude/agents/code-reviewer.md` — the reviewer's checklist. Loads only for a code review.

The two rules files load through their `paths` frontmatter, and only once a matching file is actually read: a
`git diff` or a grep does not trigger them. Before writing code in either part, make sure its rules are in
context, and read the file if they are not.

When the review agent runs on a pull request, the whole `.claude/` folder is restored from `main`, like this file:
a pull request cannot rewrite the rules it is judged by.

## Repository layout

```
src/RoboWash.slnx         solution — Api and xUnit only, the client is not part of it
src/RoboWash.Api/         ASP.NET Core API (net10.0) and the Dockerfile that builds its image
src/RoboWash.xUnit/       integration tests: the API over a throwaway Postgres in a container
src/robo-wash-react/      React + TypeScript client (Vite), opened separately in VS Code; Dockerfile, nginx template
db/                       SQL script that creates the database from scratch: tables, then reference data
.github/workflows/        CI (tests, client build, review agent) and CD (tests, then both Cloud Run services)
```

## Language

Code, identifiers and file names — English. UI strings — Russian. Comments may be Russian.

## Naming

A name must answer what the thing does without asking the team. A longer precise name beats a short vague one.

## Comments

Comments explain WHY, not WHAT — what the code does must be readable from the name and the body. Non-obvious
business rules, workarounds and deliberate demo shortcuts are exactly what deserves a comment.

A redundant comment is noise, however true it is. Extracting code into a method or a class already says that it
is reused or deserves a name of its own, so a comment restating that ("kept in one place because two callers
need it") adds nothing. Neither does a comment that repeats one written elsewhere: the snapshot columns of a wash
session are explained once, on the entity, not at every place that fills them.

## Formatting

Lines up to ~125 chars. Don't break short statements across lines. The limit is about code: a config value that
cannot be wrapped — a CLI argument list in YAML, a long URL — is not a finding. A method signature that runs a few
characters past the limit stays on one line; it is wrapped only when it is well past.

## Workflow

- Never `git commit`, `git push` or open a pull request. The user does that. Leave the working tree review-ready.
- One feature branch per feature.
- Tests ship with the code in the same pull request: a branch that adds or changes API behaviour adds the
  integration tests that pin it down. A pull request is a finished feature, and behaviour nobody has pinned down is
  not finished. The client has no tests for now by decision — the focus is the backend.
- Packages are approved before they are installed (npm and NuGet alike): list every package with vendor, version
  and what it is needed for, wait for the user's go-ahead, then run the install yourself. This project rule wins
  over any standing "never install" preference.
- When the user gives a code-style correction that generalises, write it into the file it belongs to — this one
  or one of the rules files — instead of only fixing the current spot.

## Code review agent

A context-free reviewer checks every branch twice. Locally, once, over the whole diff against `main`, right before
the pull request is opened — run the `code-reviewer` agent. And on the pull request itself, through
`.github/workflows/code-review.yml`. Not per commit: a commit can be a fragment, a pull request is a finished
feature, and a defect caught before it is never pushed at all. The pull request agent reads its rules from `main`
and skips pull requests that change its own workflow — two blind spots the local run covers.

What counts as a finding and how it is reported lives in `.claude/agents/code-reviewer.md`. Two habits belong to
the author, not the reviewer:

- Never explain your own changes in pull request comments. The action feeds comments, review bodies and inline
  replies into the model's context, so a written rationale anchors the reviewer on the author's reading before it
  forms its own — and a reported verification it cannot repeat closes the question without any evidence it can
  audit. Reasons belong in code comments and in the rules files, where they stay durable and checkable.
- Never edit `.github/workflows/code-review.yml` in a feature branch. The action refuses to run when the workflow
  differs from the default branch, so the branch silently gets no review at all. Such changes go straight to `main`.
