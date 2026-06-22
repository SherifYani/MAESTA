---
name: react-navigation-audit-pages
description: Audit React Router header/footer/dashboard navigation and add missing pages using existing design-system conventions.
source: auto-skill
extracted_at: '2026-06-21T15:57:39.131Z'
---

# React Navigation Audit And Missing Pages

Use this when a user asks to ensure header/footer/dashboard navigation works and to create pages for missing links in a React Router app.

## Procedure

1. Inspect navigation sources and routes together.
   - Read header/footer components first, then the root router and route-group files.
   - Check both desktop and mobile paths, dropdown items, form-based navigation, and footer legal/support links.
   - Include nested routers such as dashboard, jobs, gigs, AI, notifications, subscription, and chat.
   - For dashboard layouts, inspect both the header dropdown (`DashboardHeader`) and sidebar/config (`dashboard.config.js`), because they can have separate settings/profile destinations.

2. Build a link-to-route map before editing.
   - Mark links that already resolve through route groups such as `/jobs/*`, `/gigs/*`, `/ai/*`, `/dashboard/*`, `/subscription/*`.
   - Treat hash-only links (`#privacy`) in the footer as not real navigation if the user wants working pages.
   - For search forms, prefer redirecting to an existing search-capable module (for example `/jobs?search=...`) rather than inventing `/search` unless a search page is requested.
   - For dashboard links, compare dropdown `href`/`to` values against `DashboardRoutes.jsx` children, not only `App.js`.

3. Preserve existing valid role navigation.
   - Do not remove valid role-specific links for roles not currently visible in the immediate bug report, such as `admin`, `client`, or backend role aliases like `employer`.
   - Normalize role aliases only if the current auth context uses those values.
   - Avoid replacing authenticated support links with protected routes when the same footer is visible to guests; create a public `/contact` page when needed.
   - Do not save or repeat user-provided test credentials unless they explicitly ask to store them; use them only for the immediate verification task if needed.

4. Fix dashboard profile/settings intent carefully.
   - A link labeled `Profile` should normally open `/dashboard/profile`.
   - A link labeled `Profile Settings` should open `/dashboard/profile/edit` only when the user specifically wants profile-edit fields.
   - A link labeled `Settings` or `Account` should open `/dashboard/account` when the project has a separate account settings page.
   - If the backend exposes user settings endpoints, build or wire a dedicated settings page instead of redirecting settings to profile edit. In MAESTA this means using `GET /api/Profile/me/settings` and `PUT /api/Profile/me/settings`.
   - If dropdown links use raw `<a href>` for internal dashboard routes, convert to `button` plus `navigate(...)` or `Link` to avoid full reloads and to centralize logout handling.
   - After converting anchors to buttons, update CSS so `.menuItem` includes button reset styles: transparent background, no border, full width, inherited font, and left text alignment.

5. Add missing pages with a reusable pattern.
   - Prefer one reusable public information page component driven by a `pageKey` map for simple footer/legal/company pages.
   - Add routes in the root router for each public path: `/about`, `/blog`, `/careers`, `/privacy`, `/terms`, `/security`, `/cookies`, `/accessibility`, `/contact`.
   - Use the existing layout (`MainLayout`), `Link`, CSS Modules, CSS variables, and design-system tokens rather than hardcoded styling.
   - Add PropTypes if the project uses them in nearby components.

6. Convert internal anchors to router links.
   - Use `Link` from `react-router-dom` for internal footer links to prevent full page reloads.
   - Keep external links as normal anchors with `target="_blank"` and `rel="noopener noreferrer"` where appropriate.
   - Remove redundant accessibility attributes flagged by lint, such as `role="list"` on a `ul`.

7. Verify in layers.
   - Run targeted lint on changed files first; this catches most JSX/import/accessibility problems quickly.
   - Grep the edited navigation components for remaining `href="#`, `href="/`, raw internal `<a>`, and missing `/search` references.
   - Attempt a full build if practical, but if a large React build fails due environment memory/disk space, report that separately and include the successful targeted checks.
   - If tools fail with `ENOSPC`, stop relying on npm-based verification and report that disk space must be cleared before lint/build can complete.

## MAESTA-Specific Notes

- `Header.jsx` mobile search should route to `/jobs?search=...` because `/search` is not defined.
- Public footer pages can be implemented via `Frontend/src/pages/MarketingInfoPage.jsx` and `MarketingInfoPage.module.css` using `MainLayout` and design tokens.
- Public footer/legal route additions belong in `Frontend/src/App.js` before the catch-all `/404` route.
- Dashboard support (`/dashboard/help`) is protected, so footer guest support should point to a public `/contact` route.
- In `DashboardHeader.jsx`, `Profile Settings` should target `/dashboard/profile/edit`; `Account` should target `/dashboard/account`; `Billing` should target `/dashboard/billing`; `Help & Support` should target `/dashboard/help`.
- In `dashboard.config.js`, role sidebar items named `Settings` should target `/dashboard/account` when the user asks settings not to redirect/open the profile page.
