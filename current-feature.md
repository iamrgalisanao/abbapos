# Current Feature: Pricing & Promo Engine

**Work Type:** Feature Work
**Epic:** Commercial Operations
**Status:** In Progress
**Compliance impact:** High
**Receipt impact:** High
**Tax impact:** High
**Audit required:** Yes
**Offline-sensitive:** Yes
**Manager approval required:** Yes (for manual overrides)

## Business Objective
Implement a robust Pricing and Promotions Engine to handle item-level discounts, bill-level discounts, and promotional rules (e.g., Senior Citizen/PWD exemptions) while maintaining strict tax calculation integrity.

## Acceptance Criteria
- [ ] Implement `PricingEngine` with support for percentage and fixed-amount discounts.
- [ ] Implement Senior Citizen and PWD discount logic (VAT exemption + 20% discount).
- [ ] Ensure Tax Engine consumes net-of-discount prices for VAT calculation.
- [ ] Update `ReceiptEngine` to display discount breakdowns and tax exemptions clearly.
- [ ] Log all discount applications in the `ComplianceAuditEngine`.
- [ ] Support manager approval for manual price overrides or excessive discounts.
