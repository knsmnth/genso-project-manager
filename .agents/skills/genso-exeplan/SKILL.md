---
name: genso-exeplan
description: Standardized workflow and strict architecture guidelines for creating Executable Plans (Exeplans) and implementing UI or functional changes in GenSO Project Manager. Trigger whenever the user asks for an 'exeplan', 'execution plan', or plans UI/functional modifications to ensure clean, uncluttered, type-safe, and modular code.
argument-hint: "[feature or refactor task]"
license: MIT
metadata:
  author: GenSO Architecture Team
  version: "1.0.0"
---

# GenSO Executable Plan (Exeplan) Skill & Architecture Guide

This skill enforces strict architectural integrity, code hygiene, and a phased execution plan (Exeplan) workflow for any UI or functional changes across the **GenSO Project Manager** application.

---

## 1. When to Use This Skill

Activate this workflow whenever:
* The user says **"make an exeplan"**, **"execution plan"**, or asks to plan changes.
* Creating a new feature, view, modal, or form.
* Refactoring existing UI components or backend API integrations.
* Modifying state management or navigation routing.

---

## 2. Core Architectural Invariants (Non-Negotiable Rules)

Every change made to this codebase MUST respect these boundaries:

### Rule 1: Strict Directory Segregation
Never dump loose files into `src/components/`. All components must live in their designated domain folder:
* `src/views/` — Full page views only (`DashboardView.vue`, `WorkOrdersView.vue`, etc.).
* `src/components/layout/` — Global shell/chrome components (`Header.vue`, `Sidebar.vue`, `Breadcrumbs.vue`).
* `src/components/modals/` — Modal overlays and slide-in drawers (`AttendanceModal.vue`, `DetailsModal.vue`, `RemarksDrawer.vue`).
* `src/components/ui/` — Generic, reusable UI primitives (`Toast.vue`, `SearchableCombobox.vue`, `ColorPickerWithPresets.vue`).
* `src/stores/` — Pinia stores for shared state, persistent storage, and sync logic.
* `src/router/` — Vue Router configuration (`index.ts`).
* `src/styles/` — Dedicated stylesheet files (`create-order.css`, `catalogs.css`, etc.).
* `src/services/` — Database, HTTP client, and background sync services.
* `src/types/` — TypeScript interfaces and type definitions.

### Rule 2: Anti-Monolith & File Size Limits
* **Maximum 400–600 lines per `.vue` file:** If a component exceeds 600 lines, it must be decomposed into sub-components.
* **Component Extraction:** Forms, tables, summary cards, and drawers must be separated into dedicated sub-components.

### Rule 3: CSS Separation & Anti-Clutter
* **Never embed large CSS blocks:** Any component with more than 80 lines of CSS **MUST** have its stylesheet extracted to `src/styles/<feature-name>.css`.
* **Link via scoped src attribute:**
  ```vue
  <style scoped src="../../styles/my-component.css"></style>
  ```
  *(Or `src="../styles/my-component.css"` depending on directory depth).*

### Rule 4: State Management (Pinia-First)
* **Zero Prop-Drilling in `App.vue`:** Never pass down props or bubble events through `App.vue` when state is shared across views.
* Use domain stores:
  * `useUIStore`: Navigation (`activeView`), search queries, modals visibility, toasts, sidebar layout.
  * `useWorkOrdersStore`: Work orders, status updates, inspections, and CRUD.
  * `usePersonnelStore`: Personnel list, teams, attendance, onboarding.
  * `useCatalogsStore`: Master catalogs (offices, equipment, types) with local & API persistence.

### Rule 5: Capacitor & Mobile Compatibility
* **Router History:** Always use `createWebHashHistory()` in `src/router/index.ts` to prevent broken `file://` routing in Capacitor Android WebViews.
* **Touch Targets:** Buttons and interactive elements must have a minimum tap area of 44x44px.
* **Mobile-Responsive:** Every view must support mobile layouts (`@media (max-width: 640px)`).

---

## 3. The Exeplan Protocol: How to Make an Exeplan

When the user asks for an **exeplan**, follow this mandatory 4-step protocol:

### Step 1: Draft the Exeplan Artifact
Create a dedicated markdown artifact in the artifact directory (`<appDataDir>\brain\<conversation-id>\<feature>_execution_plan.md`) with `RequestFeedback: true`.

#### Required Exeplan Sections:
1. **Executive Objective:** 1–2 sentences on what is being accomplished and why.
2. **Architectural Impact & Inventory:** Table listing all files to be created, modified, or relocated, with directory checks.
3. **Phased Implementation Roadmap:**
   * **Phase 1: Foundation & Types/Stores:** Setup data contracts, Pinia actions, or API routes.
   * **Phase 2: UI Structure & Component Extraction:** Create modular components with externalized CSS.
   * **Phase 3: Integration, Wiring & Routing:** Connect views to stores/router.
   * **Phase 4: Quality & Compilation Gate:** Run automated verification.
4. **CSS & Styling Strategy:** Specify exact stylesheet locations.
5. **Quality Gates & Verification:** Specific validation commands.
6. **Rollback & Safety Plan:** How to revert cleanly if tests fail.

### Step 2: Solicit Approval Before Applying Changes
Present the plan to the user. Do not apply destructive or sweeping code changes until the user approves or confirms to proceed.

### Step 3: Phase-by-Phase Execution with Verification
* Execute one phase at a time.
* After each phase, test build compilation:
  ```powershell
  npm run build
  npx tsc --noEmit
  ```
* Update the Exeplan artifact checklist with `(STATUS: COMPLETED ✅)` as milestones are reached.

### Step 4: Final Acceptance Gate
Verify:
1. `npm run build` exits with code 0.
2. `npx tsc --noEmit` exits with 0 errors.
3. No `.vue` file has been left cluttered with hundreds of lines of inline CSS.
4. Clean Git status (`git status -s`).

---

## 4. Standard Exeplan Markdown Template

Agents must follow this template when creating the plan artifact:

```markdown
# [Feature / Change Name] Execution Plan

## 1. Objective & Scope
Brief description of the change, user goal, and architectural scope.

## 2. File & Component Inventory
| File Path | Action | Type | Responsibility |
| :--- | :--- | :--- | :--- |
| `src/views/...` | Modify / Create | View | ... |
| `src/components/...` | Create | Sub-component | ... |
| `src/styles/...` | Create | CSS | Externalized styles |
| `src/stores/...` | Modify | Pinia Store | State & business logic |

## 3. Architectural Rules Compliance
- [ ] Directory Segregation: Correct folder used (`views/`, `components/ui/`, `modals/`, etc.)
- [ ] CSS Separation: Extracted to `src/styles/` if >80 lines
- [ ] State Pattern: Pinia store utilized (no `App.vue` prop drilling)
- [ ] Mobile/Capacitor: Hash history & touch targets verified

## 4. Phased Implementation Roadmap
### Phase 1: Data Contracts & Store Updates
- [ ] Task 1.1: ...
- [ ] Task 1.2: ...

### Phase 2: Component Implementation & Styling
- [ ] Task 2.1: ...
- [ ] Task 2.2: ...

### Phase 3: Wiring, Routing & Store Integration
- [ ] Task 3.1: ...
- [ ] Task 3.2: ...

### Phase 4: Verification & Build Gate
- [ ] `npm run build` validation
- [ ] `npx tsc --noEmit` TypeScript check

## 5. Risk Assessment & Rollback Strategy
| Risk | Probability | Impact | Mitigation / Rollback |
| :--- | :--- | :--- | :--- |
| ... | Low/Med/High | Low/Med/High | ... |
```
