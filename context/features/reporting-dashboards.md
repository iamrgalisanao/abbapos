# Feature: Reporting Dashboards (X-Read/Z-Read)

**Work Type:** Feature Work / Compliance
**Epic:** Commercial Operations
**Status:** In Progress
**Compliance impact:** High
**Receipt impact:** Yes (X/Z reports are printed)
**Tax impact:** Yes (Tax breakdown reporting)
**Audit required:** Yes
**Offline-sensitive:** Yes
**Manager approval required:** Yes (for Z-Read)

## Business Objective
Provide legally required sales reporting for restaurant operations and BIR compliance.

## Key Logic
- **X-Read**: Snapshot of sales totals for a terminal/branch for the current period. Does not reset totals.
- **Z-Read**: Finalized daily sales summary. It increments the "Z-Counter", resets daily sales totals for the next business day, and captures the starting/ending invoice numbers for the period.
- **Grand Total Accumulator**: Maintains a running total of all sales since the terminal was activated (Old Grand Total + Current Sales = New Grand Total).

## Affected Modules
- `ReportingEngine`: Primary logic and state management.
- `SettlementEngine`: Source of sales data.
- `ReceiptEngine`: Rendering of X/Z reports.

## Verification Proof
- `tests/verify_reporting.js`
