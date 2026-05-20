# Purchasing Domain

Manages procurement workflows, supplier registries, and incoming goods receipts.

## Planned Modules

| Module | Responsibility |
| :--- | :--- |
| `supplier` | Vendor profiles, contacts, and payment terms |
| `purchaseOrder` | Procurement request documents sent to suppliers |
| `goodsReceipt` | Dock counts and verification of received items |

## Communication Rules
- **Writes to inventory**: After goods receipt, `goodsReceipt.service` calls `inventory/stock.service.increaseStock()`.
- **Reads catalog**: `purchaseOrder.service` validates items via `catalog/item.service`.
