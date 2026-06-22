---
name: react-date-input-standardization
description: Find native React date inputs, route them through a shared DateInput component, and verify design/build compatibility.
source: auto-skill
extracted_at: '2026-06-22T00:18:13.115Z'
---

# React Date Input Standardization

Use this when a user asks to detect all date inputs in a React project and make them follow the site's shared design/component system.

## Procedure

1. Locate the shared date component and all native date fields.
   - Search for component files first: `rg --files | rg -i "dateinput|date-input|dateInput"`.
   - Search code for native date fields and existing component usage: `rg "type=[\"']date[\"']|type=\{[\"']date[\"']\}|DateInput|dateInput"`.
   - Include JSX, TSX, JS, and TS files; native date fields are often hidden in page-level forms rather than shared form modules.

2. Inspect design conventions before editing.
   - Read the shared input component/CSS and nearby page module CSS to match border radius, colors, spacing, focus rings, labels, and error styling.
   - If the date component already has custom CSS, compare it to current shared form tokens; old component-specific styling may be visually inconsistent even if functional.
   - Preserve accessibility behavior: labels, `aria-describedby`, keyboard navigation, clear button, and calendar dialog controls.

3. Make the date component reusable beyond birth dates.
   - Avoid hardcoding age validation for all usages. Add props such as `showAge`, `allowPast`, `allowFuture`, `minDate`, and `maxDate` when the component must support deadlines or start dates.
   - Keep the existing birth-date defaults backward compatible: age range validation remains active when `showAge` is true.
   - For future-oriented fields, pass `showAge={false}`, `allowFuture={true}`, and `allowPast={false}` so the calendar does not reject every future date.
   - Initialize the calendar month from the current value when present, otherwise from the most useful boundary date (`maxDate`, `minDate`, or today).

4. Replace native date inputs carefully.
   - Import the shared `DateInput` in page forms that currently use `<input type="date">`.
   - Replace only the date control, keeping the existing form state shape and `onChange` handler contract (`event.target.name` and `event.target.value`).
   - Remove duplicate outer labels if `DateInput` renders its own label.
   - Do not pass arbitrary unsupported attributes unless the component forwards them; instead add explicit props if needed.

5. Redesign the shared CSS in the design-system style.
   - Prefer existing CSS variables and tokens (`--color-input`, `--color-border`, `--color-accent-pink`, `--radius-md`, spacing tokens) over hardcoded colors.
   - Align dimensions and states with other form controls: input background, border, hover state, focus ring, muted placeholders, and destructive error state.
   - Keep the calendar popup visually consistent but simpler than the field; preserve responsive/mobile behavior and reduced-motion rules.
   - Remove stale selectors for classes no longer rendered by the component to avoid confusing future maintenance.

6. Verify in two passes.
   - Re-run the date search and confirm there are no remaining `type="date"` usages unless intentionally excluded.
   - Run the frontend build or targeted lint. If the first build fails from Node heap/memory, retry with a larger heap, e.g. on Windows: `set NODE_OPTIONS=--max_old_space_size=4096 && npm run build`.
   - Report unrelated pre-existing warnings separately and do not expand scope to fix them unless requested.
   - Check `git status` for unrelated modified files and mention them without reverting.

## Pitfalls

- A date component built for date of birth usually rejects future dates; deadline/start-date usages need separate range semantics.
- Native date input replacement can accidentally break form updates if the shared component does not emit an event-like object with `target.name` and `target.value`.
- Full React builds in this project can fail with out-of-memory under the default Node heap; retrying with `NODE_OPTIONS=--max_old_space_size=4096` may be necessary before treating it as a code failure.
