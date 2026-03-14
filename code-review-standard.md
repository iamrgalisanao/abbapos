# Code Review Standard and Acceptance Policy

This project uses a structured, risk-based review model to ensure features are secure, maintainable, testable, and compliant.

## 1. Review Model
All meaningful changes must undergo the following review layers:
- **Design Review**: Confirm requirements, scope, module ownership, compliance impact, and rollback approach.
- **Implementation Review**: Confirm code correctness, architectural fit, naming clarity, and error paths.
- **Specialist Review**: Triggered for high-risk behavior (Tax, Receipt, RBAC, etc.).
- **Validation Review**: Confirm test and manual validation results, and doc updates.

## 2. Risk-Based Specialist Reviewers
- **Receipt Reviewer**: Layout, numbering, reprint, printed totals.
- **Tax Reviewer**: VAT, service charge, discounts, exemptions, rounding.
- **Promo Reviewer**: Stacking rules, exclusions, overrides.
- **RBAC Reviewer**: Roles, approval flows, backend enforcement.
- **Offline Reviewer**: Queueing, replay, dedupe, recovery.
- **Reporting Reviewer**: Transactional truth vs report consistency.
- **Security Reviewer**: Trust boundaries, auth, sessions, input handling.
- **Refactor Reviewer**: Duplication, dead code, structural drift.

## 3. Minimum Review Checklist
- Requirement and business logic correctness.
- Architecture and engine ownership.
- Naming, readability, and duplication (No Dead Code).
- Error handling, logging, and auditability.
- Test coverage and security impact.
- Backend permission enforcement.
- Documentation synchronization.

## 4. Standards Baseline
We align with:
- **NIST SSDF**: Secure development lifecycle discipline.
- **OWASP ASVS & Code Review Guide**: Security verification and inspection.
- **Twelve-Factor App**: Deployment and lifecycle hygiene.

## 5. Review Acceptance Rules (Gate)
A change **MUST NOT** be merged if:
- Acceptance criteria are not verified.
- Receipt-sensitive, Tax, or permission logic was not reviewed by a specialist.
- Security findings remain untriaged.
- Tests are missing for high-risk changes.
- Documentation or context files are out of sync.
- Duplicated protected business logic exists in uncontrolled locations.

## 6. Review Evidence
Evidence must be recorded in `progress.md` or dedicated feature records, capturing:
- What was reviewed and by whom.
- Risks checked and validation performed.
- Findings raised and their resolution status.
