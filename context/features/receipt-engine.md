# Feature Record: Receipt Engine

**Epic:** Compliance Core
**Status:** Implemented
**Date:** 2026-03-14
**Compliance Impact:** Critical

## Description
The core engine for generating BIR-compliant official receipts. It manages sequential numbering, store/terminal identity, and formatting for all customer-facing sales documents.

## Key Logic
- **Sequential Numbering**: Gapless numbering per terminal (`OR-<TerminalID>-<Sequence>`). Uses an `initSequence` method to resume from the last known number.
- **Rendering**: Implements `renderText` for thermal printer output, ensuring all BIR-mandated fields (TIN, PTU, Accreditation) are correctly placed.
- **Reprint Handling**: Tracks the "Last Receipt ID" to allow reprints without incrementing the sequence. Reprints are explicitly labeled and logged.

## Best Practices Followed
- **Atomic Operations**: Number increment and composition happen in a single call to prevent race conditions.
- **Strict Formatting**: No ad-hoc formatting allowed in other modules; all output passes through this engine.

## Verification Proof
See `verify_receipt.js` and `verify_void_refund.js` (for status labels).
