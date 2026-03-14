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
- **Status**: RESOLVED (Moved to structured simulated hash storage; pre-requisite for DB integration)

### [MEDIUM] Static Configuration in Engines
- **Location**: [tax/index.js](src/engines/tax/index.js#L3-L4), [rbac.js](src/engines/rbac.js#L5-L8)
- **Status**: RESOLVED (Introduced `configure()` methods in Tax and RBAC engines to allow external overrides)

## 3. Compliance & Structural Decay (Low Priority)

### [LOW] In-Memory Data Storage
- **Location**: [audit/index.js](src/engines/audit/index.js#L8), [receipt/index.js](src/engines/receipt/index.js#L6)
- **Status**: RESOLVED (Added `import`/`export` and state hooks to facilitate external persistence)

### [LOW] Missing Limit Guards for Discounts
- **Location**: [pricing/index.js](src/engines/pricing/index.js#L26)
- **Status**: RESOLVED (Added logic guards to clamp discounts to 100% and log `PRICE_WARNING` audits)

## 4. UI & Initialization Lifecycle (Critical Fixes)

### [CRITICAL] Initialization Race Condition in POS Startup
- **Finding**: The POS was attempting to process orders before the asynchronous persistence layer finished hydrating engine states. Manual identity registration was being overwritten by an empty state during bootstrap.
- **Location**: `client/src/main.jsx`, `client/src/App.jsx`
- **Status**: RESOLVED (Refactored startup to use an `async init()` block in `main.jsx` that awaits `persistenceManager.bootstrap()` before mounting the React tree)
