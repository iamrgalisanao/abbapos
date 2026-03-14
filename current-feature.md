# Current Feature: Security & Hygiene Sweep (Periodic)

**Work Type:** Operational Work / Compliance
**Epic:** Commercial Operations
**Status:** In Progress
**Compliance impact:** High
**Receipt impact:** None
**Tax impact:** None
**Audit required:** Yes
**Offline-sensitive:** No
**Manager approval required:** No

## Business Objective
As per the [Security Scanning and Code Hygiene Guardrails](security-hygiene-guardrails.md), we must perform periodic sweeps to ensure the codebase remains secure, maintainable, and free from silent structural decay. This first sweep focuses on fixing critical vulnerabilities in the core engines.

## Acceptance Criteria
- [x] Perform comprehensive audit of core engines.
- [x] Document all findings in `findings.md`.
- [ ] Eliminate hardcoded plaintext passwords in `auth.js`.
- [ ] Enforce proper RBAC checks in `settlement.js` (void/refund).
- [ ] Validate payment totals in `settlement.js` to prevent "change" manipulation.
- [ ] Ensure all fixes are verified with a new verification script `tests/verify_security_fixes.js`.
