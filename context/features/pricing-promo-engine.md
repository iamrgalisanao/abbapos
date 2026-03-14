# Feature Record: Pricing & Promo Engine

**Epic:** Commercial Operations
**Status:** Implemented
**Date:** 2026-03-14
**Compliance Impact:** High

## Description
A centralized engine for calculating item-level and bill-level pricing adjustments, specifically focused on maintaining BIR-compliant tax integrity for Philippines-based retail.

## Key Logic
- **Standard Discounts**: Applied before tax calculation. VAT is computed on the net discounted price.
- **SC/PWD Logic**: 
    1. Remove 12% VAT (`Gross / 1.12`).
    2. Apply 20% discount on the net-of-VAT price.
    3. Final Price = `Sales net of VAT * 0.80`.

## Modules Affected
- `src/engines/pricing/index.js` (Core logic)
- `src/engines/settlement.js` (Integration point)
- `src/engines/receipt/index.js` (Rendering)

## Best Practices Followed
- **No side effects**: Pricing engine only returns calculated values.
- **Traceable**: Every discount application requires a reason code and is logged to the Audit Engine.
- **Net-of-tax calculation**: strictly follows BIR Revenue Regulations for Senior Citizen/PWD exemptions.

## Verification Proof
See `verify_discounts.js` for automated tests cases.
