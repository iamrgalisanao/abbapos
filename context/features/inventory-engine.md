# Feature Record: Inventory Engine

**Epic:** Commercial Operations
**Status:** Implemented
**Date:** 2026-03-14
**Compliance Impact:** Medium

## Description
A core engine for tracking stock levels and movement history. It ensures that every sale results in a corresponding inventory deduction and that manual adjustments are properly authorized and logged.

## Key Logic
- **Automatic Deduction**: The `deductFromOrder(order)` method is called by the `SettlementEngine` only after an order is successfully moved to `PAID` status.
- **Manual Adjustments**: Requires a `managerId` and a `reasonCode`. Supported types include `RECEIVE`, `ADJUST`, `RETURN`, and `LOSS`.
- **Audit Logging**: All movements generate an `InventoryLog` entry and are also mirrored in the central `ComplianceAuditEngine`.

## Modules Affected
- `src/engines/inventory/index.js` (Core logic)
- `src/engines/settlement.js` (Integration point)
- `src/models/InventoryLog.js` (Data model)
- `src/models/catalog/Item.js` (Metadata)

## Best Practices Followed
- **Manager-in-the-loop**: Mandatory authorization for manual stock corrections.
- **Immutable Logs**: Movement history is preserved for reconciliation.
- **Atomic updates**: Stock levels are updated in-memory (to be persisted in a DB in future phases).

## Verification Proof
See `verify_inventory.js` for full sale-and-adjustment cycle validation.
