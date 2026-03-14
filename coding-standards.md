# Coding Standards

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
- **Workflow**: Create a branch from `main` -> Implement & Verify -> Update Documentation -> Merge via PR/Review.
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `docs:`, `chore:`).

## Test Expectations
- Every feature must have unit and integration tests.
- Sales flows require end-to-end validation.
- Receipt output must be verified for all changes.
