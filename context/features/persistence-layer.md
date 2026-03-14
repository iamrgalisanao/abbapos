# Feature: Persistence Layer

**Work Type:** Infrastructure / Compliance
**Epic:** Integrations & Scale
**Status:** In Progress
**Compliance impact:** High (Ensures audit logs and receipt series survive crashes)
**Receipt impact:** No logic change, but sequence preservation.
**Tax impact:** No.
**Audit required:** Yes.
**Offline-sensitive:** Yes (Critical for offline resilience).

## Business Objective
Transition the POS from an ephemeral in-memory state to a durable persistent state. This ensures that sales data, inventory levels, and compliance audit logs are preserved across application restarts, power failures, or crashes.

## Key Logic
- **Atomic Writes**: Prevent data corruption during crashes using temporary file swaps.
- **Bootstrapping**: Load all engine states on application startup.
- **Standardized Hooks**: All engines implement `exportState()` and `importState()`.

## Affected Modules
- `StorageEngine`: Low-level I/O.
- `PersistenceManager`: Orchestration.
- All Core Engines (Inventory, Audit, Reports, Customers, Receipt, Order).

## Verification Proof
- `tests/verify_persistence.js`
