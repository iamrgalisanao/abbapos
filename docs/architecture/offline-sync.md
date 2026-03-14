# Offline Sync Strategy

## Principles
1. **Idempotency**: Every transaction must have a unique local ID to prevent duplicates.
2. **Traceability**: All offline actions must include a timestamp and terminal ID.
3. **Queueing**: Transactions are queued locally and synced sequentially.

## Conflict Resolution
- Last write wins for non-transactional data? (To be decided)
- Financial transactions should never conflict (each has a unique ID).
