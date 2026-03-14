# Current Feature: Inventory Movement Automation

**Work Type:** Feature Work
**Epic:** Commercial Operations
**Status:** In Progress
**Compliance impact:** Medium
**Receipt impact:** Low
**Tax impact:** Low
**Audit required:** Yes
**Offline-sensitive:** Yes
**Manager approval required:** Yes (for manual adjustments)

## Business Objective
Implement automatic inventory deduction upon successful sales finalization. This ensures real-time stock tracking and prevents over-selling or stock discrepancies.

## Acceptance Criteria
- [ ] Implement `InventoryEngine` to track stock levels per Item ID.
- [ ] Create `InventoryLog` model to record all movements (SALE, RECEIVE, ADJUST).
- [ ] Integrate `SettlementEngine` to automatically deduct stock on `ORDER_SETTLED`.
- [ ] Support manual stock adjustments with mandatory reason codes and manager approval.
- [ ] Implement a simple "Low Stock" alert threshold in the `Item` model or `InventoryEngine`.
- [ ] Log all inventory changes to the `ComplianceAuditEngine`.
