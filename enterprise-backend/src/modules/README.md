# Modules Directory — Domain-Grouped Modular Monolith

This directory organizes all business feature modules grouped into **Business Domains**.
Each module internally follows the exact **7-File Module Pattern** unchanged.

## Domain Groups

| Domain | Path | Modules |
| :--- | :--- | :--- |
| **system** | `modules/system/` | `user`, `branch`, `upload`, `notification` |
| **pos** | `modules/pos/` | `order`, `shift`, `table`, `kitchenStation`, `posPoint`, `posSettings`, `payment`, `bill` |
| **catalog** | `modules/catalog/` | `item`, `category`, `coupon`, `modifier`, `pricing` |
| **inventory** | `modules/inventory/` | `stock`, `stockAdjustment`, `stockLog`, `warehouse` |
| **purchasing** | `modules/purchasing/` | `supplier`, `purchaseOrder`, `goodsReceipt` |
| **finance** | `modules/finance/` | `account`, `journalEntry`, `tax`, `expense`, `installment` |
| **crm** | `modules/crm/` | `customer`, `loyalty` |
| **hr** | `modules/hr/` | `employee`, `attendance`, `payroll`, `leave` |
| **reporting** | `modules/reporting/` | `salesReport`, `inventoryReport`, `financeReport` |
| **ecommerce** | `modules/ecommerce/` | `cart`, `checkout` |

## The 7-File Module Pattern (Unchanged)

Every module must contain exactly these files:

```
module-name/
  module-name.schema.ts       # Drizzle ORM table definition
  module-name.repository.ts   # Database queries (Drizzle only)
  module-name.service.ts      # Business logic orchestration
  module-name.controller.ts   # Express request/response handling
  module-name.routes.ts       # Route definitions
  module-name.validation.ts   # Zod request body schemas
  module-name.docs.ts         # Swagger/OpenAPI documentation
```

## Architectural Rules

### Dependency Flow
```
route → controller → service → repository → database
```

### Communication Rules
- ✅ **Service → Service**: Allowed for business workflows
- ✅ **Cross-module joins in repositories**: Allowed for reporting/read-heavy queries
- ❌ **Controller → Repository**: Banned
- ❌ **Repository → Repository**: Banned
- ❌ **Direct schema mutations across modules**: Banned for writes

### Naming Conventions
- **Folder names**: singular `camelCase` (e.g. `posPoint`, `journalEntry`)
- **Database tables**: plural `snake_case` (e.g. `pos_points`, `journal_entries`)

## Central Aggregators

- **`schema.ts`**: Imports and re-exports all Drizzle schemas for `drizzle-kit` migration generation.
- **`routes.ts`**: Registers all Express routers under the `/api` base path.

## Database Scripts

- `npm run db:generate` — Generate Drizzle migration files from schema changes
- `npm run db:push` — Push schema changes directly to the database (dev only)
- `npm run db:migrate` — Run generated migrations
- `npm run db:studio` — Open Drizzle Studio to inspect data
