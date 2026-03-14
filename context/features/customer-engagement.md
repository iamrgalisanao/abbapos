# Feature: Customer Engagement

**Work Type:** Feature Work
**Epic:** Customer Engagement & Scale
**Status:** In Progress
**Compliance impact:** Low (VAT is calculated on net amount after redemption)
**Receipt impact:** Yes (Points earned/balance display)
**Tax impact:** No
**Audit required:** Yes (Points redemption)
**Offline-sensitive:** Yes
**Manager approval required:** Recommended for redemption > 500 points.

## Business Objective
Build customer loyalty and track spending behavior to personalize service and drive repeat visits.

## Key Logic
- **Profile Search**: Locate customers by phone number.
- **Points Accrual**: Award points based on total amount paid (₱100 = 1 pt).
- **Points Redemption**: Use active points as a payment method or discount (1 pt = ₱1).
- **Audit**: Log all point adjustments and redemptions.

## Affected Modules
- `CustomerEngine`: Core logic for profiles and points.
- `SettlementEngine`: Triggers accrual and redemption.
- `ReceiptEngine`: Formats loyalty info for the customer.

## Verification Proof
- `tests/verify_loyalty.js`
