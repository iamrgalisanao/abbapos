# Current Feature: Reporting Dashboards (X-Read/Z-Read)

**Work Type:** Feature Work / Compliance
**Epic:** Commercial Operations
**Status:** In Progress
**Compliance impact:** High
**Receipt impact:** Yes
**Tax impact:** Yes
**Audit required:** Yes
**Offline-sensitive:** Yes
**Manager approval required:** Yes (for Z-Read)

## Business Objective
Implement legally required sales summary reporting (X-Read and Z-Read) to ensure BIR compliance and operational visibility.

## Acceptance Criteria
- [ ] `ReportingEngine` tracks Gross, Net, VAT, Exempt, Zero-Rated, Discount, and Service Charge totals.
- [ ] `ReportingEngine` maintains a persistent sequential Z-counter.
- [ ] `ReportingEngine` maintains a Grand Total Accumulator (Running Total).
- [ ] `generateXRead()` provides a non-resetting snapshot of the current period.
- [ ] `generateZRead()` provides a finalized summary, increments the Z-counter, and resets daily accumulators.
- [ ] reports include the starting and ending invoice (OR) numbers for the period.
- [ ] All reporting actions are logged to the `ComplianceAuditEngine`.
- [ ] Verification script `tests/verify_reporting.js` confirms total accuracy and sequence integrity.
