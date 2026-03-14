# Feature Record: Void & Refund Policy

**Epic:** Compliance Core
**Status:** Implemented
**Date:** 2026-03-14
**Compliance Impact:** Critical

## Description
Standardized policy for reversing transactions. Every reversal must be authorized by a supervisor and leaves an permanent audit trail.

## Key Logic
- **Authorization**: Requires a `supervisorId` and a mandatory `reason`.
- **Audit Logging**: Every attempt (success/failure) is logged in the `ComplianceAuditEngine`.
- **Receipt Marking**: Voided receipts are dynamically titled "VOID RECEIPT" and prepended with a `*** VOID ***` status line to prevent fraudulent re-use.

## Modules Affected
- `src/engines/settlement.js` (Reversal logic)
- `src/engines/receipt/index.js` (Status rendering)

## Best Practices Followed
- **Supervisory Control**: Implements manager-in-the-loop protection for sensitive financial reversals.
- **Negative Testing**: Verification scripts include tests for unauthorized attempts.
- **Reference Integrity**: Void/Refund results return a clear success/status payload for the caller.

## Verification Proof
See `verify_void_refund.js`.
