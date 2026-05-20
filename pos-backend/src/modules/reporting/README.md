# Reporting Domain

Contains read-heavy, analytically optimized query modules.
Cross-module SQL joins are explicitly ALLOWED here for performance.

## Planned Modules

| Module | Responsibility |
| :--- | :--- |
| `salesReport` | Joins orders, customers, items, payments for daily/weekly/monthly summaries |
| `inventoryReport` | Stock levels, adjustment logs, low-stock alerts |
| `financeReport` | Ledger summaries, profit/loss statements, tax reports |

## Architectural Exception
Reporting repositories may import Drizzle schemas from multiple domains directly
to perform optimized SQL joins in a single query.

This avoids Node.js memory stitching of thousands of records.

```typescript
// Allowed in reporting repositories:
import { orders } from "@/modules/pos/order/order.schema.js";
import { customers } from "@/modules/crm/customer/customer.schema.js";
import { payments } from "@/modules/pos/payment/payment.schema.js";
```

Reporting modules NEVER write to any external domain table.
