# Feature Record: Low-Stock Alerts

**Epic:** Commercial Operations
**Status:** Implemented
**Date:** 2026-03-14
**Compliance Impact:** Low

## Description
A proactive monitoring system integrated into the `InventoryEngine` that ensures store management is notified when stock for critical items reaches a minimum threshold.

## Key Logic
- **Threshold Check**: Every time stock is modified (sale or adjustment), the `checkThreshold` method compares `currentQty` against the item's `alertThreshold`.
- **Alert Trigger**: A breach triggers an `InventoryAlert` record and pops a dedicated `ALERT_LOW_STOCK` entry into the `ComplianceAuditEngine`.
- **Alert Resolution**: Replenishing stock above the threshold automatically resolves the alert and logs an `ALERT_RESOLVED` event.

## Modules Affected
- `src/engines/inventory/index.js` (Monitoring logic)
- `src/models/InventoryAlert.js` (Data model)
- `src/models/catalog/Item.js` (Threshold metadata)

## Best Practices Followed
- **Debounced Alerts**: Uses an internal `alerts` Map to ensure only one active alert exists per item, preventing log spam.
- **Audit Traceability**: All alert lifecycle events (trigger and resolution) are captured in the immutable audit trail.
- **Zero-overhead Monitoring**: Logic is closely coupled with stock updates to ensure real-time accuracy without additional polling.

## Verification Proof
See `tests/verify_alerts.js` for sale-to-alert and refill-to-resolution cycle validation.
