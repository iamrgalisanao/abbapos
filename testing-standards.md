# Testing Standards

This document defines the testing architecture and standards for the BIR-Compliant F&B POS.

## 1. The B.L.A.S.T. Testing Philosophy
Every feature implementation must follow the **Test and Verify** stage of the B.L.A.S.T. protocol. No code is considered "complete" until it has passed its corresponding verification script.

## 2. Test Architecture

### 2.1 Verification Scripts (`/tests/*.js`)
Currently, we use scenario-driven verification scripts that simulate end-to-end business flows.
- **Location**: All tests must reside in the `/tests` directory.
- **Naming**: `verify_[feature_name].js`.
- **Exit Codes**: Scripts MUST exit with `process.exit(0)` on success and `process.exit(1)` on failure.

### 2.2 Core Test Scenarios
Every feature must include tests for:
1.  **Happy Path**: The standard successful execution.
2.  **Negative Path**: Unauthorized attempts, missing parameters, or invalid states.
3.  **Boundary Cases**: Extreme values (zero prices, max discounts).
4.  **Compliance Loop**: Verifying that audit logs were generated and receipt formatting is correct.
5.  **Security Review**: Scanning for unauthorized access paths and insecure direct object access as per [security-hygiene-guardrails.md](security-hygiene-guardrails.md).

## 3. Integration Requirements
Tests must initialize the following engines to create a realistic execution context:
- `IdentityEngine`: To set store and terminal identity.
- `AuthEngine`: To simulate a logged-in user with specific roles.
- `CatalogEngine`: To load relevant items and modifiers.

## 4. Assertion Standards
- Use explicit console logging for step-by-step visibility.
- Use `Math.abs(a - b) < 0.01` for currency comparisons to avoid float precision issues.
- Every assertion failure must log a descriptive error message before exiting.

## 5. Automation Workflow
- **Pre-Commit**: AI must run the relevant verification script before proposing a commit.
- **Regression**: When modifying core engines (Tax, Receipt, Settlement), ALL existing verification scripts in `/tests` must be run to ensure no regressions.

## 6. Future Roadmap
- Transition from ad-hoc scripts to a formal test runner (e.g., **Vitest**) in Phase 4.
- Implement UI testing using **Playwright** once the frontend is integrated.
