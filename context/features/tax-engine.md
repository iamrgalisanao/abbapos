# Feature Record: Tax Engine

**Epic:** Compliance Core
**Status:** Implemented
**Date:** 2026-03-14
**Compliance Impact:** Critical

## Description
A protected module for all tax-related math. It handles VAT (12%) and Service Charge (10%) computations, supporting both inclusive and exclusive pricing models.

## Key Logic
- **VAT-Inclusive Logic**: Backs out VAT using `Gross / 1.12` to find the net VATable amount.
- **Service Charge**: Applied to the net-of-VAT base amount.
- **Rounding**: Enforces consistent rounding to 2 decimal places across all engines.

## Best Practices Followed
- **Centralized Math**: All currency-sensitive arithmetic is isolated here to prevent calculation drift across the POS.
- **Exemption Support**: Built-in support for `isVatExempt` flag.

## Verification Proof
See `verify_tax.js`.
