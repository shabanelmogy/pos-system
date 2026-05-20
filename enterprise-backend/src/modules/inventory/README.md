# Inventory Domain

Manages physical warehouse stock levels, adjustments, and audit trails.

## Planned Modules

| Module | Responsibility |
| :--- | :--- |
| `stock` | Current real-time stock balance per item per warehouse |
| `stockAdjustment` | Manual stock additions, reductions, inventory counts |
| `stockLog` | Immutable historical ledger of every stock movement |
| `warehouse` | Physical storage locations |

## Communication Rules
- **Reads catalog**: `stock.service` may call `catalog/item.service` to validate item existence.
- **Writes are isolated**: No direct writes to `catalog` or `pos` tables.
