# Findings

## 2026-03-14: Initialization
- [Discovery] System is being built from scratch in the `abbapos` directory.
- [Evidence] Directory listing showed only `spec.md` (the guardrails) initially.
- [Discovery] BIR compliance requires gapless sequential numbering per terminal, which is now enforced by the `ReceiptEngine`.
- [Discovery] Reprints must be explicitly logged and marked, now handled by the `ReceiptEngine` and `ComplianceAuditEngine` integration.
