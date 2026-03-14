# Coding Standards

Follow the [Security Scanning and Code Hygiene Guardrails](security-hygiene-guardrails.md) and the [Code Review Standard and Acceptance Policy](code-review-standard.md) for every change.

## Naming Conventions
- Clear and descriptive names for variables and functions.
- Use prefixes for compliance-sensitive logic if necessary.

## Module Boundaries
- Follow the Module Architecture defined in the POS Guardrails.
- No direct mutation of state across engines. Use defined API/events.

## Error Handling
- Comprehensive error handling for all sales and payment flows.
- Log sensitive errors to the Audit Engine.

## Version Control & Branching
- **Main Branch (`main`)**: The source of truth for BIR-compliant, verified production code. No direct commits allowed.
- **Feature Branches (`feat/*`)**: Use for new features or commercial capabilities.
- **Fix Branches (`fix/*`)**: Use for bug fixes or repairs.
- **Compliance Branches (`compliance/*`)**: Use for critical tax, receipt, or audit rule changes.
- **Workflow**: Create a branch from `main` -> Implement & Verify -> **Sync Documentation (Changelog, Roadmap, Progress)** -> Merge via PR/Review.
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `docs:`, `chore:`).

## Testing
- Strictly follow the formal [testing-standards.md](testing-standards.md).
- Every feature must have a corresponding verification script in the `tests/` directory.
- Regression tests must be run for any changes to core engines (Tax, Receipt, Settlement).

## Future Stack Standards (Phase 5+)
- **Frontend**: Follow React best practices (Hooks, Functional Components, atomic design).
- **Backend**: PSR-12 for PHP, Laravel's clean architecture, and Eloquent for MySQL interactions.
- **Interoperability**: Logic from existing JS engines should be ported or bridged to maintain "source of truth" consistency.
