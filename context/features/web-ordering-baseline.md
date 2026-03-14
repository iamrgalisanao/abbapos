# Web/Online Ordering Integration Baseline

We are implementing the foundational logic to accept and process orders from external sources (Website, Delivery Apps) while maintaining BIR-compliant sequence and audit trails.

## User Review Required

> [!IMPORTANT]
> This phase focuses on the **logic and API structure** (Headless) to receive external orders, not the actual frontend integration or Laravel backend (Phase 5).

## Proposed Changes

### Integration & Order Engines

#### [MODIFY] [Order.js](file:///Users/teamsolo/Documents/Dev/abbapos/src/models/Order.js)
- Add `externalSource` (e.g., 'WEB', 'FOODPANDA') and `externalReferenceId` fields.
- Update `serviceType` to include `WEB_ORDER` and `APP_DELIVERY`.

#### [NEW] [IntegrationEngine.js](file:///Users/teamsolo/Documents/Dev/abbapos/src/engines/IntegrationEngine.js)
- Create baseline for receiving external order payloads.
- Implement validation for external payloads against system requirements.
- Integration with `OrderEngine` to convert external raw data into internal `Order` models.

#### [MODIFY] [PersistenceManager.js](file:///Users/teamsolo/Documents/Dev/abbapos/src/engines/PersistenceManager.js)
- Register `IntegrationEngine` (if stateful).

---

## Verification Plan

### Automated Tests
- `tests/verify_web_ordering.js`:
    - Simulate an incoming JSON payload from a web source.
    - Verify it creates a valid DRAFT order in the `OrderEngine`.
    - Verify external metadata (Source, Ref ID) is preserved in the audit log.
    - Verify these orders follow the standard BIR-compliant settlement flow.
