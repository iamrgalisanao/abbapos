# Offline Sync Strategy

## Principles
1. **Idempotency**: Every transaction must have a unique local Sync ID (e.g., `SYNC-TIMESTAMP-RANDOM`) to prevent duplicates.
2. **Traceability**: All offline actions must include a timestamp and terminal ID.
3. **Queueing**: Transactions are stored in a local `SyncQueue` and processed sequentially.

## Data Structures
### Sync Entry
```json
{
  "id": "SYNC-1710400000000-abcde",
  "type": "ORDER",
  "status": "PENDING | SYNCED | FAILED",
  "data": { ... },
  "attempts": 1,
  "timestamp": "2026-03-14T...",
  "lastError": null
}
```

## Conflict Resolution
- **Sequential Processing**: Financial transactions follow the order of the local queue.
- **Unique Identification**: Each record has a globally unique ID generated at the point of origin, ensuring cloud-side deduplication.
