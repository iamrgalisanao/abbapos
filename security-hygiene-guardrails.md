# Security Scanning and Code Hygiene Guardrails

## 1. Purpose
This document defines how the project handles vulnerability discovery, insecure code patterns, dependency risk, exposed secrets, dead code, and cleanup discipline. The goal is to keep the system secure, maintainable, reviewable, and free from silent structural decay.

## 2. Core Security and Hygiene Rule
**Mandatory Rule**: Security risk and code hygiene are not optional cleanup activities; they are part of normal delivery. No feature, fix, or refactor is complete without considering security risks and code hygiene.

## 3. Vulnerability Scanning Scope
### Minimum Security Review Areas:
- Authentication and Authorization (bypass/permissions)
- Input Validation Gaps & Injection Risk
- Exposed Secrets, Tokens, or Hardcoded Credentials
- Data Leakage & Insecure API exposure
- Insecure Dependency usage

### POS-Specific Review Areas:
- Discounts, Overrides, Refunds, Voids, Reprints
- Terminal Identity & Cashier Shift close
- Stock Adjustments & Reporting endpoints
- Offline sync & Admin-only configurations

## 4. Scan Stages
- **Design**: Ask if the change affects money, permissions, or untrusted input.
- **Implementation**: Apply strong validation, protected secrets, and constrained trust.
- **Review**: Inspect routes, raw queries, sensitive logs, and dependencies.
- **Release**: Confirm no unresolved criticals and no compliance-sensitive paths unvalidated.

## 5. Dependency and Package Risk
- No new libraries for convenience if native patterns suffice.
- Review every update for maintenance/vulnerability risk.
- **Required**: Run dependency vulnerability review before merge for any package changes.

## 6. Secret and Sensitive Data Handling
- **NEVER** commit secrets, tokens, or live credentials.
- **NEVER** log full sensitive payloads or internal tokens.
- Inspect for `.env` leakage and hardcoded keys in tests or JS bundles.

## 7. Security Severity Gates
- **Critical**: (Auth bypass, money manipulation) Must block merge.
- **High**: (Weak authorization) Resolve before release.
- **Medium**: (Partial validation gaps) Resolve promptly or document.
- **Low**: (Minor hardening) Backlog but do not ignore.

## 8. Code Scanning and Structural Risk
- **Structural Risk Rule**: Any code that computes money, taxes, discounts, approvals, or receipt values outside the protected engines is a scan finding.
- Review for raw SQL, missing validation, and duplicated protected business logic.

## 9. Orphaned and Dead Code Cleanup
- Assess every task for unused functions, classes, components, or abandoned feature flags.
- **Safe Removal Rule**: Confirm no direct/indirect references before deleting.
- **Removal/Deprecation**: Remove confirmed dead code; deprecate if removal risk exists.

## 10. Merge and Release Gate
A change is **NOT COMPLETE** if:
- Critical vulnerabilities remain.
- High-risk endpoints are unreviewed.
- Secrets exposure is unresolved.
- Dead code removal was unsafe.
- Protected business logic remains duplicated.
