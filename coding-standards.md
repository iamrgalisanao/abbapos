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

## Test Expectations
- Every feature must have unit and integration tests.
- Sales flows require end-to-end validation.
- Receipt output must be verified for all changes.
