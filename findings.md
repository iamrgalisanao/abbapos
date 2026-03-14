# Security & Hygiene Sweep Findings (2026-03-14)

This sweep audited core engines against the newly established [Security Scanning and Code Hygiene Guardrails](security-hygiene-guardrails.md).

## 1. High Priority Findings (Action Required)

### [CRITICAL] Hardcoded Plaintext Passwords in `auth.js`
- **Location**: [auth.js](src/engines/auth.js#L7-L11)
- **Status**: RESOLVED (Implemented base64-simulated hashing and removed plaintext from memory)

### [HIGH] Weak Authorization Check in `settlement.js`
- **Location**: [settlement.js](src/engines/settlement.js#L101,L127)
- **Status**: RESOLVED (Enforced RBAC checks via `rbacEngine` and `authEngine` users)

### [HIGH] Manipulation of Payment Totals in `settlement.js`
- **Location**: [settlement.js](src/engines/settlement.js#L71)
- **Status**: RESOLVED (Added validation to reject insufficient payments and calculate change against internal totals)

## 2. Hygiene Findings (Moderate Priority)

### [MEDIUM] Mock Data in Production Engines
- **Location**: [auth.js](src/engines/auth.js#L7)
- **Risk**: In-memory mock user list prevents real authentication integration and can be accidentally committed to production-like environments.
- **Status**: OPEN

### [MEDIUM] Static Configuration in Engines
- **Location**: [tax/index.js](src/engines/tax/index.js#L3-L4), [rbac.js](src/engines/rbac.js#L5-L8)
- **Issue**: VAT rates and permission matrices are hardcoded.
- **Recommendation**: Move to a configuration file or database structure (e.g., `StoreConfig`).
- **Status**: OPEN

## 3. Compliance & Structural Decay (Low Priority)

### [LOW] In-Memory Receipt Sequence
- **Location**: [receipt/index.js](src/engines/receipt/index.js#L6)
- **Issue**: Receipt sequence is lost on restart. Structural weakness for BIR-required sequential numbering.
- **Status**: OPEN

### [LOW] Missing Limit Guards for Discounts
- **Location**: [pricing/index.js](src/engines/pricing/index.js#L26)
- **Issue**: Pricing engine clamps to 0 but doesn't log or flag when a discount exceeds 100% of the value.
- **Status**: OPEN
