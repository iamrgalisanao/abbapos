# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- **Customer Engagement (Loyalty & Profiles)**: Automated point accrual (₱100 = 1pt) and redemption logic. Includes searchable customer profiles by phone number and receipt-integrated point balances.
- **Supplier & Purchase Workflows**: Integrated vendor management and formal Purchase Order (PO) tracking with automated inventory reconciliation upon receipt.
- **Reporting Dashboards (X-Read/Z-Read)**: BIR-compliant daily sales reporting with sequential Z-counters, grand total accumulators, and tax/discount breakdown snapshots.
- **Security & Hygiene Cleanup**:
    - **Password Hardening**: Removed plaintext credentials and implemented base64-simulated hash verification.
    - **RBAC Enforcement**: Hardened sensitive actions (voids, refunds) at the business logic layer with role-based checks.
    - **Payment Integrity**: Validated amountPaid against system truth in `SettlementEngine`.
    - **Configuration Logic**: Extracted hardcoded tax rates and permission matrices into configurable state.
    - **Persistence Foundations**: Added state export/import hooks to core engines to handle in-memory data loss.
- **Low-Stock Alerts**: Proactive threshold monitoring and notification (via audit logs) when stock levels fall below predefined limits.
- **Inventory Movement Automation**: Automatic stock deduction upon order payment and manual adjustment support with manager approval authorization.
- **Pricing & Promo Engine**: Support for item-level/bill-level discounts and BIR-compliant Senior Citizen/PWD exemptions (VAT-exempt + 20% discount).
- **Void & Refund Policy**: Supervisor-authorized void/refund workflows with dedicated audit logging and receipt marking.
- **Split/Merge Bill**: Ability to split items into new orders or merge orders back together.
- **Order Lifecycle**: Dine-in, Takeout, and Delivery service types with Hold/Resume capabilities.
- **Item Catalog**: Support for complex items and modifier selections.
- **Compliance Core**:
    - `IdentityEngine`: Terminal registration and store configuration.
    - `AuthEngine`: Cashier login and RBAC.
    - `TaxEngine`: VAT (12%) and Service Charge (10%) calculation.
    - `ReceiptEngine`: Sequential OR numbering and BIR-required layout fields.
    - `AuditEngine`: Immutable/protected compliance logs.

### Fixed
- Fixed property mapping mismatch between `OrderLineItem` and `ReceiptEngine` formatting logic.
- Resolved sequential numbering reset issues during terminal initialization.
