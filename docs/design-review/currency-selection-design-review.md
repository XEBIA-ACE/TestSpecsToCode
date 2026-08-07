# Design Review: Currency Selection UI Component

**Feature:** Currency Selection User Interface  
**User Story:** US-001 — Currency Selection Component  
**Review Date:** 2025-01-30  
**Status:** Completed — Action Items Pending Implementation

---

## 1. Participants

| Name / Role                  | Attendance |
|------------------------------|------------|
| Frontend Lead Developer      | ✅ Present  |
| UI/UX Designer               | ✅ Present  |
| Product Owner                | ✅ Present  |
| Backend Integration Engineer | ✅ Present  |
| QA Engineer                  | ✅ Present  |

---

## 2. Session Agenda

1. Review the proposed currency selection component design (dropdown vs. modal vs. inline selector).
2. Evaluate accessibility and internationalisation considerations.
3. Assess integration points with existing state management and pricing APIs.
4. Identify UX concerns and edge cases.
5. Agree on action items and owners.

---

## 3. Design Artefacts Reviewed

- Wireframe: `CurrencySelector_v1.fig` (Figma link shared in Slack #design channel)
- Component spec: `specs/us-001/spec.md`
- Technical plan: `specs/us-001/plan.md`
- Frontend constitution: `.specify/memory/constitution.md`

---

## 4. Feedback Collected

### 4.1 UI/UX Designer Feedback

| # | Feedback Item | Priority |
|---|---------------|----------|
| D-01 | The dropdown should display the currency **symbol** (e.g., `$`, `€`, `£`) alongside the ISO code and full name for quick recognition. | High |
| D-02 | A **search/filter input** inside the dropdown is recommended given the requirement to support more than ten currencies — scrolling through a long list degrades UX. | High |
| D-03 | The selected currency should be **persisted visually** (e.g., highlighted or shown in the header/navbar) so users always know the active currency without reopening the dropdown. | Medium |
| D-04 | Ensure the component meets **WCAG 2.1 AA** contrast ratios and is fully keyboard-navigable (arrow keys, Enter to select, Escape to close). | High |
| D-05 | On mobile viewports the dropdown should expand to a **bottom sheet** or full-width modal to avoid clipping. | Medium |

### 4.2 Frontend Lead Developer Feedback

| # | Feedback Item | Priority |
|---|---------------|----------|
| F-01 | Use the existing **shadcn/ui `Select` or `Combobox`** primitive (already in `FRONTEND/default_shadcn_theme.css`) rather than building a custom dropdown from scratch — reduces maintenance burden. | High |
| F-02 | Currency state should live in a **React Context** (or existing global store) so any component tree node can read the active currency without prop-drilling. | High |
| F-03 | The component must be **lazy-loaded** if the currency list is fetched remotely to avoid blocking the initial render. | Medium |
| F-04 | Export the component as a named export from `FRONTEND/src/components/CurrencySelector/index.tsx` to keep the import path predictable. | Low |

### 4.3 Product Owner Feedback

| # | Feedback Item | Priority |
|---|---------------|----------|
| P-01 | The initial supported currency list should include at minimum: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, MXN, SGD (12 currencies — satisfies the >10 acceptance criterion). | High |
| P-02 | Price updates on currency change must feel **instantaneous** (< 100 ms perceived latency); if a network call is required, show a skeleton/spinner on the price fields only — not the whole page. | High |
| P-03 | Out of scope for this story: storing the user's preferred currency between sessions. A follow-up story will cover persistence. | Info |

### 4.4 Backend Integration Engineer Feedback

| # | Feedback Item | Priority |
|---|---------------|----------|
| B-01 | The pricing API already accepts a `currency` query parameter (ISO 4217 code). No backend changes are needed for this story. | Info |
| B-02 | Confirm that the frontend sends the ISO 4217 three-letter code (e.g., `USD`) — not a symbol or locale string — to avoid backend parsing errors. | High |

### 4.5 QA Engineer Feedback

| # | Feedback Item | Priority |
|---|---------------|----------|
| Q-01 | Unit tests should cover: default currency render, currency change event, price update after selection, and keyboard navigation. | High |
| Q-02 | Add an integration test that mounts the component within the app shell and verifies that selecting a currency updates at least one price display element. | Medium |
| Q-03 | Test with RTL (right-to-left) locales (e.g., Arabic) to ensure the dropdown layout does not break. | Low |

---

## 5. Decisions Made

| Decision | Rationale |
|----------|-----------|
| Use shadcn/ui `Combobox` as the base primitive (F-01) | Aligns with existing design system; reduces custom CSS. |
| Currency state via React Context (F-02) | Keeps the component decoupled from any specific state library. |
| Minimum 12 currencies at launch (P-01) | Satisfies the >10 acceptance criterion with a sensible default set. |
| Send ISO 4217 codes to the API (B-02) | Prevents backend parsing errors; already supported by the pricing endpoint. |
| WCAG 2.1 AA compliance required (D-04) | Aligns with the constitution's UX quality principle. |

---

## 6. Action Items

| ID   | Action Item | Owner | Priority | Target Sprint |
|------|-------------|-------|----------|---------------|
| AI-01 | Add search/filter input to the currency dropdown (D-02) | Frontend Dev | High | Current |
| AI-02 | Display currency symbol + ISO code + full name in each option (D-01) | Frontend Dev | High | Current |
| AI-03 | Implement keyboard navigation (arrow keys, Enter, Escape) and ARIA attributes (D-04) | Frontend Dev | High | Current |
| AI-04 | Show active currency in the navbar/header after selection (D-03) | Frontend Dev | Medium | Current |
| AI-05 | Implement React Context for currency state (F-02) | Frontend Dev | High | Current |
| AI-06 | Add responsive bottom-sheet behaviour on mobile (D-05) | Frontend Dev | Medium | Next |
| AI-07 | Write unit tests covering the four scenarios identified by QA (Q-01) | QA / Frontend Dev | High | Current |
| AI-08 | Write integration test for currency change → price update flow (Q-02) | QA | Medium | Current |
| AI-09 | Validate RTL layout compatibility (Q-03) | QA | Low | Next |
| AI-10 | Confirm lazy-loading strategy for remote currency list (F-03) | Frontend Lead | Medium | Current |

---

## 7. Out-of-Scope Items Confirmed

The following items were raised during the session but confirmed as **out of scope** for US-001:

- Persisting the selected currency across user sessions (P-03) — deferred to a follow-up story.
- Currency conversion rate management — explicitly excluded in `specs/us-001/spec.md`.
- Backend currency data storage.

---

## 8. Next Steps

1. Frontend developer to begin implementation incorporating action items AI-01 through AI-05 and AI-10.
2. QA engineer to draft test cases for AI-07 and AI-08 in parallel.
3. UI/UX designer to update Figma wireframe to reflect the search input (AI-01) and mobile bottom-sheet (AI-06) before the next sprint.
4. Design review follow-up scheduled for end of sprint to validate implementation against this feedback.

---

*Document prepared by: Frontend Lead Developer*  
*Reviewed and approved by all session participants.*
