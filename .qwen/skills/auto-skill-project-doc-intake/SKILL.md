---
name: project-doc-intake
description: Systematically read project Markdown docs and reconcile conflicting/stale project context before implementation work.
source: auto-skill
extracted_at: '2026-06-21T15:22:51.527Z'
---

# Project Doc Intake

Use this when a user asks to understand a project from its Markdown documentation before making changes.

## Procedure

1. Discover Markdown files first.
   - Prefer a fast file search such as `rg --files -g "*.md"` when shell is available, or the project file search tool.
   - Include nested documentation directories such as backend docs, reports, architecture notes, and status files.

2. Read high-signal docs before long reports.
   - Start with `README.md`, current status, API integration notes, architecture reports, and quick summaries.
   - Then read detailed specs, gap reports, database/ERD docs, navigation audits, and validation checklists.
   - For large files, read the beginning plus later sections containing summaries, known gaps, or conclusions.

3. Track contradictions explicitly.
   - Treat newer status/integration reports as more likely current than older general docs.
   - Do not silently merge conflicting claims; call out conflicts such as "README says mock-only, but current API status says live integration is active."
   - When a later task depends on a disputed claim, verify against code before acting.

4. Extract reusable working context.
   - Project purpose and user roles.
   - Frontend/backend stack and important directories.
   - API base URL, auth/token flow, service-to-controller mapping.
   - Route/dashboard structure and missing pages.
   - Design-system conventions and coding standards.
   - Known risks, stale docs, database/index mismatches, and testing recommendations.

5. Summarize for action.
   - Keep the final brief structured and concise.
   - Include file references for the most important claims.
   - End by asking which workstream to prioritize, unless the user already gave the next task.

## MAESTA-Specific Notes From This Intake

- `CURRENT_STATUS.md` and `api_integration.md` indicate the frontend/backend API integration is active, JWT-based, and tested for auth/dashboard role flows.
- `README.md` still describes the app as mock-data/demo-ready, so verify current code before relying on mock-only statements.
- Older frontend/backend gap docs mention a missing API host and duplicated `/api/api`; newer API integration docs say those are resolved.
- Database index artifacts need verification before use: docs report mismatches between entity fields and generated migration/script columns.
- Backend API work should follow the Arabic Swagger/documentation/response-model rules in `Backend/API_RULES.md` and `Backend/VALIDATION_CHECKLIST.md`.
