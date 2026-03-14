# RBAC Matrix

| Role | Catalog View | Order Create | Void Sales | Refund | Manage Users |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Cashier | Yes | Yes | No | No | No |
| Supervisor | Yes | Yes | Yes | No | No |
| Manager | Yes | Yes | Yes | Yes | No |
| Admin | Yes | Yes | Yes | Yes | Yes |

## Enforcement Points
- UI: Hide restricted buttons.
- Engine: Check permissions before processing sensitive commands.
- Audit: Log all attempts and approvals.
