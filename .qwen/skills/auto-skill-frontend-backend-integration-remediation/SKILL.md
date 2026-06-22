---
name: frontend-backend-integration-remediation
description: Fix React/ASP.NET frontend-backend integration issues in safe phases, from baseline verification through endpoint and payload alignment.
source: auto-skill
extracted_at: '2026-06-20T12:59:26.792Z'
---

# Frontend/Backend Integration Remediation

Use this after an integration audit finds React frontend calls that are mocked, missing, or mismatched against ASP.NET API controllers.

## Phased Procedure

1. Establish a baseline before changing behavior.
   - Inspect the HTTP client (`ApiService.js`) for base URL, `/api` prefix policy, auth token injection, 401 handling, response shape, and upload helper behavior.
   - Inspect `Frontend/package.json` and the solution/project files to identify build/test commands.
   - Run frontend and backend builds/tests first so later failures are attributable to your changes.
   - Record warnings separately from failures; do not expand scope to unrelated lint/CSS warnings unless they block the build.

2. Fix core service payload mismatches first.
   - Compare frontend service methods to controller action signatures and DTOs, including `[FromBody]` vs raw string/bool vs multipart upload.
   - Prefer adapting the frontend to existing DTOs when the backend already has a sane contract.
   - For profile save/update flows, check whether the UI combines fields that the backend splits across general and role-specific endpoints; call both endpoints instead of sending one large UI object.
   - When updating context after a save, normalize the backend response into the shape the current UI expects rather than replacing nested display state with raw DTOs.
   - Example pattern: if the UI has `FormData` containing a file but the backend apply endpoint expects JSON, upload the file first through the file endpoint, then call the business endpoint with a JSON DTO containing the uploaded URL.
   - Example pattern: if backend expects `[FromBody] string status`, send `JSON.stringify(status)` with `Content-Type: application/json`, not `{ status }`.

3. Remove fake success paths.
   - Replace `catch { return { success: true } }` with real errors or real fallback data only when the fallback is explicitly local/client-side functionality.
   - If a frontend action maps to a nonexistent backend route, either implement the route or throw/show a clear unsupported-operation message instead of pretending success.
   - For UI buttons backed by no current API (for example save/bookmark for an entity with no backend route), wire a visible informational/error state rather than leaving the button with no handler.
   - If a route exists but performs a different semantic action, do not reuse it; add the correct backend capability or disable the UI action.

4. Add small backend endpoints when the frontend need is real and simple.
   - Add interface, service, and controller methods together.
   - Keep DTO mapping server-side where possible, but avoid EF translation issues by materializing entities before calling non-translatable mapper methods.
   - Rebuild the backend immediately after endpoint additions and fix nullable warnings introduced by new projections.

5. Convert mock fallbacks into real composition.
   - If the frontend expects an aggregate endpoint that does not exist, either add the endpoint or compose existing backend endpoints in the service layer.
   - Do not silently fall back to mock workspace/dashboard data after a failed request; surface the error unless the user specifically wants demo mode.
   - When composing workspace-like data, combine the primary entity endpoint with related existing endpoints, then return the shape expected by the page.

6. Fix broken JavaScript service method usage.
   - Search for service methods used by pages/contexts and verify they are exported by the service object.
   - If a page calls a missing method, either rename the call to an existing method or add a compatibility wrapper that uses real supported endpoints.
   - For unsupported modes (for example candidate smart search when only job search exists), throw a clear error or disable that mode rather than returning fake results.

7. Replace simulated uploads with real file upload flow.
   - Use the shared API upload helper and the backend file upload endpoint.
   - Return uploaded file metadata (`url`, `fileName`, `bucketName`, original `file`) to the calling component.
   - Ensure message/send flows include the uploaded URL or attachment field expected by the backend.

8. Treat "no mocks" as a production-wide constraint when requested.
   - Search beyond obvious `mockData`: include `fakeData`, `dummyData`, `MockLoginPage`, `mock-login`, `mock_jwt`, `Demo`, `setTimeout(resolve)`, `new Promise`, hardcoded arrays used as data, localStorage draft persistence, simulated uploads, random scores, and comments that reveal mock fallbacks.
   - Distinguish UI timers from fake APIs: debounce, auto-dismiss toasts, animation timers, and post-success redirects can remain; `setTimeout` that substitutes for persistence or server response must be replaced.
   - Remove demo auth routes and token bypasses entirely when the user rejects demo authentication. Delete unused mock pages instead of hiding them behind development-only routes.
   - Rename files/modules that contain real API code but still use mock names (for example `adminMockData.js`) so future scans do not confuse them with fake data.

9. Implement real onboarding/draft flows instead of local or simulated state.
   - First search backend for existing endpoints around join requests, team membership, invitations, settings/preferences, and drafts.
   - If a suitable team/invitation endpoint already exists, bind the frontend directly and use backend success/error messages.
   - If none exists, add an end-to-end integration: DTOs, interface methods, service methods, controller actions, and frontend service methods.
   - For simple draft persistence when there is a `UserSettings.Preferences` JSON field, store named draft objects there through real settings endpoints rather than `localStorage`.
   - When adding draft storage in a shared preferences JSON field, preserve existing keys by reading/parsing preferences first, updating only the named draft key, then writing the full JSON back.

10. Verify incrementally and at the end.
   - After each phase, run the smallest relevant build/test checks.
   - At the end, run full frontend build, backend build, and backend tests.
   - Report residual warnings and intentionally unsupported features separately from completed fixes.

11. For role-specific dashboard remediation, fix wrappers and normalization together.
   - Audit route wrapper components as well as the visible page/component; wrappers often pass empty handlers like `onCreate={() => {}}` while the child component looks fully interactive.
   - Normalize backend DTOs into the UI shape at the wrapper boundary: IDs, status casing, date fields, nested stats/actions, applicant/job display names, and URLs.
   - Replace no-op dashboard actions with navigation or real service calls: create/view/edit/delete/toggle jobs, manage applicants, export data, schedule interviews, open resume/profile links.
   - If the UI exposes an action the backend does not support, remove or relabel it rather than simulating success; for example, do not keep applicant rating modals if there is no rating endpoint.
   - For interview scheduling, ensure the frontend uses the backend's actual application identifier and DTO fields (`jobApplicationId`, `scheduledAt`, `durationMinutes`, `meetingLink`/`location`) rather than UI-only `applicantId`, `scheduledDate`, or `scheduledTime` fields.
   - Re-run the frontend build after removing dead handlers; eslint no-undef/no-unused-vars errors often reveal leftover modal state or helper functions from disabled fake actions.

12. For jobseeker application-card actions, trace both the card component and its route wrapper.
   - In card UIs with bottom-right icon buttons, verify each button has a real `onClick` and is not only stopping propagation from the parent card's expand/collapse handler.
   - The route wrapper may pass `onViewApplication={() => {}}` even when the card component calls `onViewApplication(id)` correctly; wire it to a real route such as job details or application details.
   - Normalize IDs before invoking actions because application payloads may use `id`, `applicationId`, or `jobApplicationId`, while view navigation may need `jobId`, `job.id`, or `job.jobId`.
   - After a destructive service call such as withdraw succeeds, update local list state immediately (`filter` the removed application) or reload the collection so the UI visibly changes.
   - For buttons without a supported API action, provide a visible UI behavior (for example expand the card to show current status/timeline) instead of a no-op.

13. For admin dashboards that do not reflect jobs/applications, avoid public or role-limited endpoints.
   - Trace admin widgets through both the overview page and admin data service; dashboards often call `jobService.getJobs()` or employer-only endpoints that omit inactive jobs and cannot see all applications.
   - Add small Admin API endpoints for platform-wide reads when needed: `GET /api/Admin/jobs`, `GET /api/Admin/applications`, and aggregate metrics such as `activeJobs`, `totalApplications`, and `pendingApplications`.
   - Keep moderation actions under Admin API too; do not reuse employer-scoped routes like `PUT /api/jobs/{id}/status` because they can reject admins as unauthorized.
   - Normalize admin DTOs at the frontend service boundary into table/card fields (`id`, `company`, `postedBy`, `status`, `applications`, `reports`, `postedAt`) before components consume them.
   - If the normal solution build is blocked by a running API process locking DLLs, verify compile by building the API project to a temporary output folder, for example `dotnet build JobMagnet.API/JobMagnet.API.csproj -o .qwen/tmp/api-build`.

## Useful Search Patterns

```bash
rg "return \{ success: true \}|setTimeout\(resolve|Simulate API|Mock Workspace|mock_jwt_token" Frontend/src
rg "ApiService\.(get|post|put|delete|patch|upload)|axios\.|fetch\(" Frontend/src
rg "getJobRecommendations|updateApplicationStatus\(|applyToJob\(|unsubscribeFromPush|searchCompanies|getClientProfile\(" Frontend/src
rg "\[FromBody\]|\[FromForm\]|IFormFile|Http(Post|Put|Get|Delete)" JobMagnet.API/Controllers JobMagnet.Application/DTOs
rg "mockData|fakeData|dummyData|MockLoginPage|mock-login|mock_jwt|Demo Login|new Promise\(\(resolve|Simulate API|adminMockData" Frontend/src
rg "Saving draft|Draft saved|localStorage\.setItem\(.*Draft|setTimeout\(.*Draft|console\.log\(.*draft" Frontend/src
rg "JoinCompany|RequestAccess|CompanyMember|Invitation|Invite|Team|Draft|UserSettings|Preferences" JobMagnet.API JobMagnet.Application JobMagnet.Core
```

## Common Fix Patterns

### Upload Then JSON DTO

```js
const formData = new FormData();
formData.append('file', file);
formData.append('bucketName', 'resumes');
const uploadResponse = await ApiService.upload('/api/Files/upload', formData);

await ApiService.post(`/api/jobs/${jobId}/apply`, {
  coverLetter,
  cvUrl: uploadResponse.data?.url || uploadResponse.data?.Url || ''
});
```

### Raw String Body For ASP.NET `[FromBody] string`

```js
await ApiService.put(
  `/api/jobs/applications/${applicationId}/status`,
  JSON.stringify(status),
  { headers: { 'Content-Type': 'application/json' } }
);
```

### Unsupported Current API

```js
export const updateUserRole = async () => {
  throw new Error('Changing user roles is not supported by the current Admin API.');
};
```

### Drafts Through `Profile/me/settings`

```js
const parsePreferences = (preferences) => {
  if (!preferences) return {};
  try { return JSON.parse(preferences); } catch { return {}; }
};

export const saveDraft = async (key, draftData) => {
  const settingsResponse = await ApiService.get('/api/Profile/me/settings');
  const settings = settingsResponse.data || {};
  const preferences = parsePreferences(settings.preferences || settings.Preferences);
  preferences[key] = draftData;

  return ApiService.put('/api/Profile/me/settings', {
    language: settings.language || settings.Language || 'en',
    timeZone: settings.timeZone || settings.TimeZone || null,
    emailNotifications: settings.emailNotifications ?? settings.EmailNotifications ?? true,
    smsNotifications: settings.smsNotifications ?? settings.SmsNotifications ?? false,
    pushNotifications: settings.pushNotifications ?? settings.PushNotifications ?? true,
    darkMode: settings.darkMode ?? settings.DarkMode ?? false,
    preferences: JSON.stringify(preferences),
  });
};
```

## Pitfalls

- Do not use a route just because it exists if it does a different job; semantic mismatches are bugs.
- Do not keep mock fallbacks in production service methods after real endpoint integration starts.
- Do not add large backend surfaces when a small compatibility wrapper or endpoint is enough.
- Frontend builds can pass with many warnings; keep remediation focused on integration correctness unless warnings are caused by your changes.
- A grep hit for `setTimeout` is not automatically fake data; classify it by behavior before editing.
- A grep hit for `mock` can be a CSS class substring (for example `showMobile`); inspect before changing.
- If the worktree is already dirty, edit only the files needed for the integration phase and never revert unrelated user changes.
