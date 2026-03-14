# Feature: Supplier & Purchase Workflows

**Work Type:** Feature Work
**Epic:** Commercial Operations
**Status:** In Progress
**Compliance impact:** Medium (Inventory auditability)
**Receipt impact:** No
**Tax impact:** No
**Audit required:** Yes
**Offline-sensitive:** Yes
**Manager approval required:** Yes (for receiving stock)

## Business Objective
Allow restaurant operators to manage vendors and track inventory replenishment via formal Purchase Orders.

## Key Logic
- **Supplier Management**: CRUD operations for vendor profiles.
- **Purchase Order (PO)**: 
    - Create PO with multiple items and expected costs.
    - Status transitions: `DRAFT` -> `SENT` -> `RECEIVED` or `CANCELLED`.
    - **Stock Reconciliation**: When a PO is marked as `RECEIVED`, the `InventoryEngine` must automatically update stock levels and log the movement.

## Affected Modules
- `InventoryEngine`: Receives stock updates.
- `SupplierEngine`: Manages vendor data.
- `AuditEngine`: Logs stock adjustments.

## Verification Proof
- `tests/verify_suppliers.js`
