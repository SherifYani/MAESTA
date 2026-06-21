---
name: frontend-backend-integration-audit
description: Audit a React frontend against ASP.NET API controllers to find mock data, unconnected pages, and endpoint mismatches.
source: auto-skill
extracted_at: '2026-06-20T10:32:57.012Z'
---

# Frontend/Backend Integration Audit

Use this when asked to identify what is not connected in a frontend, especially in a React app backed by ASP.NET controllers.

## Procedure

1. Map the project structure first.
   - List the repo root and locate frontend source, service/client files, backend controllers, and any existing integration reports.
   - Read current code as source of truth; treat old markdown reports as hints only.

2. Find frontend API entry points.
   - Inspect the base HTTP client, e.g. `ApiService.js`, to understand base URL handling, interceptors, auth headers, and response shape.
   - Search for calls such as `ApiService.get/post/put/delete`, `axios`, and `fetch` across `Frontend/src`.
   - Search for service files (`*Service.js`, `*api*`) and route/page files that import them.

3. Find mocked or local-only areas.
   - Search for `mock`, `Mock`, `dummy`, `sample`, `USE_MOCK_DATA`, `Promise.resolve`, `new Promise`, `setTimeout`, `return []`, `return {}`, and `localStorage`.
   - Search for interaction no-ops such as `console.log(` handlers, `onClick={() => { }}`, `not yet implemented`, and service methods that `throw new Error('...not supported...')`.
   - Inspect context/provider update functions for state-only persistence (`setXData`, `localStorage.setItem`) that never calls the API, especially when the user reports save/update not changing data.
   - Ignore harmless UI placeholders, debounce timers, animation timers, and normal redirect delays unless they replace a real API call.
   - Prioritize pages/components where submission, upload, login, search, dashboard data, or analysis is simulated.

4. Compare against backend routes.
   - Inspect controllers for `[Route]`, `[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]`, and action parameters.
   - For ASP.NET controllers using `[Route("api/[controller]")]`, derive paths from the controller name and HTTP attributes.
   - Check not just paths, but payload binding: `[FromBody]` object vs raw string/bool vs `IFormFile`/`[FromForm]` multipart.
   - When save/update appears partial, read the request DTOs as well as controllers; fields may be split across endpoints (for example general profile fields vs role-specific profile fields).
   - Note route casing only when the hosting/platform makes it relevant; focus primarily on missing routes and shape mismatches.
   - Verify service method names used by pages/contexts actually exist on the exported service object; missing JS methods can break before any HTTP request is made.
   - Trace important broken service methods to downstream call sites so the report explains which pages/routes are affected.

5. Classify findings for the user.
   - `Not Connected / Mocked`: fake auth, simulated submits, local-only dashboards, mock fallbacks.
   - `Unwired Buttons / No-op Handlers`: actions that only log, empty `onClick`, UI buttons without mutation calls, and social/demo flows marked not implemented.
   - `State-only Persistence`: save/update functions that only update React state or `localStorage` without calling backend endpoints.
   - `AI/Search Gaps`: pages calling missing service methods, hardcoded suggestions, random/generated results.
   - `Endpoint Mismatches`: frontend path exists but backend route/parameter/body does not match.
   - `Payload / Body Mismatches`: route exists, but frontend sends `FormData`, `{ status }`, raw strings, IDs, or query parameters that do not match backend binding.
   - `Partial Update / Split DTO Mismatches`: UI edits fields that belong to multiple backend DTOs but calls only one endpoint, so some values never persist.
   - `Wrong Semantic Mapping`: route technically exists, but the frontend maps one operation to another (for example, changing a user role via a status toggle, or treating contract IDs as milestone IDs).
   - `Backend Gaps Used By Frontend`: frontend expects an endpoint that no controller exposes.
   - `Silent Failure Fallbacks`: catches that return empty arrays/objects and make failed API calls look like valid empty data.
   - `Mostly Connected`: areas that appear aligned, to avoid over-reporting.

6. Report with file references.
   - Include clickable file paths with start line numbers for both frontend call sites and backend controller routes when relevant.
   - Keep the output concise and actionable; list biggest integration priorities at the end.

## Useful Search Patterns

```bash
rg "ApiService\.(get|post|put|delete|patch|upload)|axios\.|fetch\(" Frontend/src
rg "mock|Mock|dummy|sample|USE_MOCK_DATA|Promise\.resolve|new Promise|setTimeout\(|return \[\]|return \{\}" Frontend/src
rg "console\.log\(`?(Action|Job|Quick action|.*clicked|.*toggled)|onClick=\{\(\) => \{ \}\}|not yet implemented|is not yet implemented" Frontend/src
rg "update[A-Za-z0-9_]*Data\s*=|set[A-Za-z0-9_]*Data\(|localStorage\.setItem" Frontend/src/context Frontend/src/pages
rg "\[(HttpGet|HttpPost|HttpPut|HttpDelete|HttpPatch)(\(\"[^\"]*\"\))?\]|\[Route\(|class .*Controller" JobMagnet.API/Controllers
rg "class (Update|Create|Add|Submit|Apply).*Request|\[FromBody\]|\[FromForm\]|IFormFile" JobMagnet.Application JobMagnet.API/Controllers
rg "serviceMethodName|missingMethodName|updateApplicationStatus\(|applyToJob\(" Frontend/src
```

## Pitfalls

- Do not rely only on existing gap reports; they can be stale after integration work.
- A frontend service can be "connected" but still wrong if it sends `FormData` to a `[FromBody]` DTO or sends `{ status }` where the backend expects raw string.
- A frontend service can also be semantically wrong even when the endpoint exists, such as using a status endpoint to update roles or using a delivery endpoint to add milestones.
- Some mock-looking code is acceptable UI behavior, such as input placeholders, progress animations, debounced suggestions, and post-success redirects. Only flag it when it substitutes for persistence or backend data.
