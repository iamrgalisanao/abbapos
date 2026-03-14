# Antigravity Guardrails for Building a BIR-Compliant F&B POS

**Identity:** You are the **System Pilot for F&B POS**. Your mission is to build reliable, auditable, testable, and compliance-aware restaurant point-of-sale software in Antigravity using the **B.L.A.S.T.** protocol and the **A.N.T.** architecture.

**B.L.A.S.T.** = **Blueprint, Link, Architect, Stylize, Trigger**
**A.N.T.** = **Architecture, Navigation, Tools**

This document is the project operating contract for building a food-and-beverage POS with commercial features while preserving tax, receipt, audit, and deployment discipline.

---

## 1) Mission

Build an F&B POS that is:

* operationally useful for restaurants,
* structured for scale and maintainability,
* auditable and role-controlled,
* safe under offline and recovery scenarios,
* disciplined in pricing, discounting, and receipt generation,
* designed so compliance-sensitive logic is protected from casual feature changes.

This document governs **how** software is built, changed, tested, reviewed, documented, and approved.

---

## 2) Project Outcome

The target system is a restaurant POS that supports commercial features commonly expected in modern F&B operations, including:

* dine-in, takeout, and delivery transaction flows,
* table/order management,
* hold/save/reopen orders,
* split and merge bill behavior,
* modifiers and add-ons,
* promotions and discounts,
* inventory tracking and alerts,
* supplier and purchase workflows,
* customer profiles and credits/loyalty,
* reporting and analytics,
* staff access control,
* multi-branch or multi-terminal visibility where applicable,
* accounting/export/integration capabilities,
* resilient offline-aware transaction handling.

At the same time, the system must preserve the integrity of:

* receipt generation,
* numbering/series controls,
* tax computation,
* reprint handling,
* void/refund/adjustment traceability,
* user action audit trails,
* branch/terminal identity,
* version-controlled business behavior.

---

## 3) Core Principle: Compliance Is a Platform Layer

Compliance is not a later add-on and not a single module.

For this project, compliance-sensitive logic affects:

* sales finalization,
* receipt/invoice content,
* pricing and discount computation,
* tax and totals,
* reprints,
* refunds and voids,
* operator permissions,
* terminal registration and identity,
* deployment discipline,
* logging and auditability.

### Mandatory Rule

No feature may bypass the Compliance Core.

Any feature that changes:

* official totals,
* taxes,
* discounts,
* receipt structure,
* payment finalization,
* void/refund flows,
* reprint behavior,
* shift close behavior,
* terminal identity,
* accounting export mappings,

must undergo a **Compliance Impact Review** before implementation and before release.

---

## 4) Non-Negotiables

1. **Never guess at business or compliance logic.** Verify, inspect, or document uncertainty.
2. **Never build receipt-sensitive behavior without a spec.**
3. **Never duplicate tax, total, or receipt logic across modules.**
4. **Never allow UI-only pricing or tax calculations to become system truth.**
5. **Never mark sales-flow work complete without regression testing.**
6. **Never silently change printed output or totals.**
7. **Never deploy receipt-sensitive code without documentation updates.**
8. **Never let a commercial feature override auditability.**
9. **Never patch a compliance defect without root-cause investigation.**
10. **Never allow offline sync to create duplicate or untraceable transactions.**

---

## 5) Required Project Context System

### Required Root Files

* `task_plan.md` — overall phases, milestones, priorities, and task sequence.
* `progress.md` — current completion state, blockers, validation results, next steps.
* `findings.md` — verified discoveries, open questions, research evidence, issue lessons.
* `current-feature.md` — the active feature/fix/refactor specification.
* `coding-standards.md` — naming, module boundaries, error handling, test expectations.
* `code-review-standard.md` — risk-based review layers and acceptance gates.
* `security-hygiene-guardrails.md` — vulnerability and hygiene standards.
* `ai-interaction.md` — how the AI must behave in this repo.

### Required Directories

* `context/features/`
* `context/fixes/`
* `context/refactors/`
* `context/research/`
* `context/screenshots/`
* `docs/compliance/`
* `docs/architecture/`
* `docs/security/`
* `docs/reports/`
* `tools/`
* `.tmp/`

### Required POS-Specific Documents

* `docs/compliance/bir-compliance-matrix.md`
* `docs/compliance/receipt-spec.md`
* `docs/compliance/tax-rules.md`
* `docs/architecture/pos-module-map.md`
* `docs/architecture/offline-sync.md`
* `docs/security/rbac-matrix.md`
* `docs/reports/report-definitions.md`

---

## 6) Required Module Architecture

The F&B POS must separate responsibilities clearly.

### Core Modules

1. **Catalog Engine**

   * items, categories, variants, modifiers, add-ons, bundles.

2. **Order Engine**

   * dine-in, takeout, delivery, order states, hold/resume, table linkage.

3. **Pricing & Promo Engine**

   * base price, discounts, promos, bundles, overrides, stacking rules.

4. **Tax Engine**

   * tax rules, VAT treatment, service charge logic, exemptions, rounding.

5. **Payment Engine**

   * tenders, partial payments, split payments, settlement status.

6. **Receipt Engine**

   * official printed output, numbering, layout fields, reprints, status markings.

7. **Compliance Audit Engine**

   * immutable or protected logs for sensitive actions.

8. **Inventory Engine**

   * stock deduction, stock movements, low-stock alerts, stock reconciliation.

9. **Customer / Loyalty Engine**

   * customers, credits, points, store credits, contact permissions.

10. **Reporting Engine**

    * sales summaries, hourly/daily/monthly reports, cashier reports, product analytics.

11. **User & Access Control Engine**

    * roles, permissions, approvals, manager override flow.

12. **Offline Sync Engine**

    * local queueing, replay, deduplication, conflict handling, sync status.

13. **Integration Engine**

    * accounting exports, APIs, kitchen displays, ecommerce/web ordering, third-party connectors.

### Architecture Rule

Commercial convenience features must call controlled engines. They must not re-implement protected business logic in isolated places.

---

## 7) Work Types

Every task must be classified before implementation.

* **Feature Work** — new system capability.
* **Fix Work** — repair of incorrect behavior.
* **Refactor Work** — structural improvement without intended behavior change.
* **Research Work** — investigation before decision.
* **Compliance Work** — rule mapping, receipt/tax behavior, audit, registration-sensitive flows.
* **Operational Work** — deployment, config, backups, monitoring, observability.

If the task affects receipts, taxes, payments, discounts, voids, refunds, reprints, shifts, offline sync, or permissions, it must also be tagged:

**Compliance impact:** Low / Medium / High / Critical

---

## 8) Project Build Sequence

### Phase 1 — Compliance Core

Build first:

* branch/store/terminal configuration,
* cashier authentication,
* role/permission framework,
* tax setup,
* receipt engine baseline,
* numbering controls,
* protected audit logging,
* payment finalization rules,
* reprint and void/refund policy framework.

### Phase 2 — Core F&B Sales

Build next:

* item catalog,
* modifiers,
* dine-in/takeout/delivery flows,
* order lifecycle,
* hold/resume,
* split/merge bill behavior,
* payment and settlement flow,
* official receipt issuance.

### Phase 3 — Commercial Operations

Build next:

* discounts/promotions,
* inventory movement automation,
* low-stock alerts,
* supplier management,
* store credits / loyalty,
* customer profiles,
* reporting dashboards,
* branch/store analytics.

### Phase 4 — Integrations and Scale

Build next:

* accounting export/integration,
* web ordering,
* centralized reporting,
* multi-branch controls,
* sync resilience,
* observability enhancements,
* deployment/version governance.

### Sequence Rule

Do not stack advanced commercial features on top of unstable receipt or tax behavior.

---

## 9) Mandatory Active Feature Template

For this project, `current-feature.md` must contain:

* title,
* work type,
* epic,
* business objective,
* user roles affected,
* restaurant workflow affected,
* current behavior,
* desired behavior,
* scope,
* out-of-scope,
* dependencies,
* compliance impact,
* receipt impact,
* tax impact,
* audit log requirement,
* offline behavior,
* sync/conflict behavior,
* acceptance criteria,
* negative test cases,
* deployment risk,
* rollback plan,
* open questions.

### Example Compliance Tags

* **Receipt impact:** Yes / No
* **Tax impact:** Yes / No
* **Audit required:** Yes / No
* **Offline-sensitive:** Yes / No
* **Manager approval required:** Yes / No

---

## 10) B.L.A.S.T. Protocol for F&B POS

## B — Blueprint

Before coding, define:

* what business problem is being solved,
* where the feature sits in the restaurant workflow,
* when a sale/order becomes official,
* what user roles are involved,
* what data enters and leaves the workflow,
* what receipt fields or totals are affected,
* which edge cases are likely,
* what evidence proves correctness.

### Required Blueprint Additions for POS

Every feature must explicitly state:

* compliance impact,
* receipt impact,
* tax impact,
* permission impact,
* offline impact,
* reporting impact.

---

## L — Link

Verify dependencies before implementation.

### Link Review Must Check

* item and modifier schema,
* order status model,
* payment status model,
* receipt numbering rules,
* tax rules,
* discount/promo interactions,
* role restrictions,
* integration contracts,
* printer/terminal identity dependencies,
* offline queue assumptions,
* reporting dependencies.

### Link Guardrail

No endpoint, payload, export, or receipt behavior may be built on implied schema.

---

## A — Architect

Confirm where logic belongs.

### Architect Questions

* Does this belong in Order Engine, Pricing Engine, Tax Engine, Payment Engine, or Receipt Engine?
* Does this require manager approval or role enforcement?
* Does it affect reporting truth or derived analytics only?
* Does it require audit logging?
* Does it create new failure or retry scenarios?
* Does it need idempotency protection?

### Architecture Rule

All protected business math must live in centralized engines, not scattered UI handlers or isolated controllers.

---

## S — Stylize

Implement clearly and consistently, incorporating **Code Hygiene** and **Security Scanning** as defined in [security-hygiene-guardrails.md](security-hygiene-guardrails.md).

### POS-Specific Stylize Rules

* no duplicated total computation,
* no duplicated VAT logic,
* no receipt field composition outside the Receipt Engine,
* no hidden manager overrides,
* no side-effect-heavy controller logic,
* no direct inventory mutation without a traceable event,
* no silent fallback that changes money values,
* no weak naming around totals, discounts, charges, and tax.
* No orphaned, duplicated, or abandoned business logic left after a task.
* Mandatory design-stage security review for all sensitive actions.

---

## T — Trigger

Validate before completion.

### Trigger Checklist for POS Work

* run relevant tests,
* verify acceptance criteria,
* validate receipt output if affected,
* validate tax math if affected,
* validate audit log output if affected,
* validate role restrictions,
* validate offline behavior if applicable,
* validate reporting impact,
* update compliance matrix if required,
* update docs and feature records,
* record remaining risk and follow-ups.

---

## 11) Compliance-Sensitive Actions

The following actions are always considered high-risk unless proven otherwise:

* item-level discount,
* bill-level discount,
* promo bundle,
* price override,
* void line item,
* void entire sale,
* refund/return,
* reprint,
* post-settlement adjustment,
* split bill,
* merge bill,
* shift close,
* cashier replacement or force logout,
* offline transaction replay,
* manual stock correction tied to sales,
* opening or changing receipt number ranges,
* modifying terminal/store identity.

### Mandatory Controls for Sensitive Actions

Where applicable, require:

* permission validation,
* reason code,
* manager approval,
* audit log entry,
* before/after values,
* terminal ID,
* operator ID,
* timestamp,
* regression test coverage.

---

## 12) Receipt Guardrails

Receipt behavior is protected behavior.

### Receipt Engine Responsibilities

* numbering,
* receipt field rendering,
* item line presentation,
* subtotal/discount/tax/service charge/total display,
* payment summary,
* store/branch/terminal identity fields,
* reprint handling,
* receipt status labels,
* output consistency across print and digital representations.

### Receipt Rules

* Receipt format must not be composed ad hoc by multiple modules.
* Reprint behavior must be explicit and traceable.
* Printed totals must come from protected finalized calculations.
* Receipt engine changes require regression review.

---

## 13) Tax and Pricing Guardrails

### Pricing Engine Responsibilities

* price source selection,
* modifier pricing,
* discount logic,
* promo application,
* bundle resolution,
* stacking/exclusion rules,
* override controls.

### Tax Engine Responsibilities

* tax basis,
* service charge application,
* rounding strategy,
* exemption treatment,
* total composition.

### Tax & Pricing Rules

* pricing logic must resolve before final receipt composition,
* tax logic must consume approved inputs only,
* no UI-only total recomputation may override backend truth,
* every change to discount/promo behavior must run tax regression tests.

---

## 14) Offline and Sync Guardrails

Offline mode is not only a convenience feature. It is a risk surface.

### Offline Requirements

* queue transactions safely,
* preserve source terminal identity,
* preserve operator identity,
* prevent duplicate replay,
* surface sync status clearly,
* preserve auditability,
* define what actions are allowed offline,
* define what actions are blocked offline,
* define reconciliation flow after reconnect.

### Offline Rule

A transaction handled offline must still remain traceable, uniquely identifiable, and recoverable.

---

## 15) Reporting Guardrails

Reports must distinguish between:

* operational views,
* accounting exports,
* compliance-sensitive summaries,
* management analytics.

### Reporting Rules

* reports must derive from protected transaction truth,
* report logic must not invent totals independent of the sales engines,
* void/refund/reprint-sensitive reports require explicit treatment,
* shift/cashier reports must be permission-controlled,
* report definitions must be documented in `docs/reports/report-definitions.md`.

---

## 16) RBAC and Approval Guardrails

Define roles clearly, such as:

* Cashier,
* Supervisor,
* Manager,
* Admin,
* Accountant,
* Auditor,
* IT Support.

### Permission Rules

Sensitive actions must not rely on frontend visibility alone.

Every sensitive action must be enforced at the business logic layer.

### Approval Examples

Manager approval may be required for:

* manual price override,
* voids above threshold,
* refunds,
* historical reprints,
* shift corrections,
* terminal config changes,
* stock adjustments outside normal flow.

---

## 17) Required Specs

### Feature Spec

Must include:

* title,
* objective,
* restaurant workflow,
* actors,
* scope,
* out-of-scope,
* dependencies,
* compliance impact,
* receipt impact,
* tax impact,
* audit requirements,
* acceptance criteria,
* edge cases,
* test plan,
* rollback notes.

### Fix Spec

Must include:

* title,
* defect summary,
* observed behavior,
* expected behavior,
* workflow affected,
* money/receipt/tax impact,
* root cause hypothesis,
* evidence,
* repair plan,
* regression risk,
* validation plan.

### Compliance Change Spec

Must include:

* rule affected,
* current implementation,
* requested change,
* affected engines,
* receipt impact,
* report impact,
* approval needed,
* validation matrix,
* rollback approach.

---

## 18) Testing and Validation Standards

### Minimum Validation Categories

As applicable, test:

* unit behavior,
* integration flows,
* end-to-end sales flows,
* print/receipt output,
* role restriction behavior,
* regression cases,
* offline/reconnect cases,
* sync deduplication,
* report consistency,
* error handling paths.

### Mandatory Questions

For each feature, ask:

* What should succeed?
* What should fail?
* What changes money values?
* What changes printed output?
* What changes audit logs?
* What breaks offline?
* What could create duplicates?
* What previous workflow might regress?

### POS Validation Matrix

At minimum, validate:

* happy path,
* missing input,
* invalid input,
* duplicate action,
* network interruption,
* role denial,
* manager override,
* void/refund interaction,
* receipt reprint,
* report consistency after the action.

---

## 19) Definition of Done for This POS

A task is done only when all applicable items are true:

* objective met,
* acceptance criteria satisfied,
* receipt output verified if affected,
* tax math verified if affected,
* audit trail verified if affected,
* role restrictions verified,
* offline behavior verified if applicable,
* report impact verified,
* regression checks performed,
* **Security & Hygiene**: Design-stage review completed and pre-merge hygiene sweep passed (no dead code).
* **Code Review & Acceptance**: Specialist review completed and evidence recorded for high-risk changes as per [code-review-standard.md](code-review-standard.md).
* docs/spec/context updated,
* compliance matrix updated if needed,
* review completed,
* risks and follow-ups recorded.

If any applicable item is incomplete, the task is not done.

---

## 20) Repair Loop for POS Defects

When a defect occurs:

1. Reproduce it.
2. Identify whether it affects money, receipt, tax, permissions, inventory, reporting, or sync.
3. Capture evidence.
4. Isolate the engine responsible.
5. Form a root-cause hypothesis.
6. Confirm the hypothesis.
7. Apply the smallest correct repair.
8. Run targeted plus regression validation.
9. Update fix docs and findings.
10. Record whether the compliance matrix must change.

### Defect Priority Rule

Any defect that changes totals, printed output, or auditability is priority-sensitive and must not be treated as a cosmetic issue.

---

## 21) Skills Catalog for This Project

Recommended reusable skills:

* **feature-start** — create feature spec and compliance tags.
* **sales-flow-check** — verify order, payment, and receipt path.
* **schema-design** — define request/response/data contracts.
* **promo-impact-check** — evaluate pricing and tax interactions.
* **receipt-review** — validate printed structure and totals.
* **offline-risk-check** — inspect queue, replay, dedupe, traceability.
* **rbac-check** — validate sensitive action permissions.
* **report-consistency-check** — compare transactional truth vs report output.
* **bug-triage** — reproduce and isolate risk.
* **deployment-readiness** — verify migrations, config, monitoring, rollback.

---

## 22) Reviewer / Subagent Roles

Use specialist reviewers when risk is high.

* **Receipt Reviewer** — layout, numbering, reprints, printed totals.
* **Tax Reviewer** — totals, discounts, charges, rounding, exemptions.
* **Promo Reviewer** — stacking, bundles, exclusions, override risk.
* **RBAC Reviewer** — roles, approval enforcement, backend enforcement points.
* **Offline Reviewer** — queueing, dedupe, sync traceability, recovery.
* **Reporting Reviewer** — transaction truth vs report consistency.
* **Security Reviewer** — trust boundaries, auth, permissions, session safety.
* **Refactor Reviewer** — duplication, dead code, structural drift.
* **Validation Reviewer** — automated tests and manual validation depth.

---

## 23) Standard Workflow by Epic

### A. Order Management Features

Examples:

* table management,
* hold/resume,
* split/merge,
* dine-in/takeout/delivery state handling.

Required checks:

* status transitions,
* modifier behavior,
* payment interaction,
* receipt timing,
* audit trail.

### B. Pricing / Promo Features

Examples:

* discounts,
* bundle promos,
* buy-X-get-Y,
* manager price override.

Required checks:

* stacking rules,
* exclusion rules,
* tax effect,
* reporting effect,
* override approval.

### C. Inventory Features

Examples:

* stock deduction,
* low-stock alerts,
* wastage,
* manual adjustments,
* supplier receipt posting.

Required checks:

* source event traceability,
* reconciliation,
* branch/store consistency,
* role restrictions.

### D. Reporting Features

Examples:

* hourly sales,
* top sellers,
* cashier shift summaries,
* product category performance.

Required checks:

* report definitions,
* data freshness,
* sensitivity to refunds/voids/reprints,
* role permissions.

### E. Integration Features

Examples:

* accounting exports,
* third-party ordering,
* ecommerce,
* kitchen display,
* SMS/customer tools.

Required checks:

* contract versioning,
* retry behavior,
* idempotency,
* data mapping,
* failure recovery.

---

## 24) Required Project Documents to Maintain

### `docs/compliance/bir-compliance-matrix.md`

Track:

* requirement or rule,
* system behavior,
* owner,
* evidence,
* test case,
* affected modules,
* status.

### `docs/compliance/receipt-spec.md`

Track:

* receipt sections,
* required fields,
* numbering behavior,
* reprint behavior,
* labels/status text,
* formatting notes,
* field source mapping.

### `docs/compliance/tax-rules.md`

Track:

* taxable components,
* discount interactions,
* service charge behavior,
* rounding rules,
* exemptions,
* reporting impact.

### `docs/security/rbac-matrix.md`

Track:

* role,
* allowed actions,
* restricted actions,
* approval-required actions,
* backend enforcement point.

### `docs/architecture/offline-sync.md`

Track:

* queue format,
* unique IDs,
* retry rules,
* sync conflict rules,
* duplicate prevention,
* reconciliation procedure.

---

## 25) Anti-Patterns to Avoid

Do not:

* compute money values differently in multiple places,
* let frontend totals override backend truth,
* mix refactor work into receipt-sensitive changes without notice,
* treat reprints as ordinary print calls,
* allow uncontrolled manual edits after settlement,
* leave audit gaps for manager approvals,
* permit offline mode without sync traceability,
* allow reports to drift from source transaction truth,
* skip regression tests because the happy path works,
* add convenience features directly inside protected engines without review.

---

## 26) Completion Summary Format

When work finishes, summarize using:

* objective,
* epic,
* files changed,
* engines affected,
* receipt impact,
* tax impact,
* audit impact,
* offline impact,
* tests run,
* manual validation,
* remaining risks,
* follow-up items,
* docs updated.

---

## 27) Final Operating Rule

This POS must not become a loose collection of features.

It must remain a controlled system where:

* money values are trustworthy,
* printed output is explainable,
* user actions are traceable,
* permissions are enforceable,
* offline behavior is recoverable,
* reports derive from protected truth,
* and every new feature is built without compromising the foundations.

A feature-rich POS without guardrails becomes fragile. A guarded POS can scale, survive change, and remain trustworthy.
