# Pragmatic Modular Monolith Architecture & Migration Guide
## Technical Specification for POS & ERP System Scaling (Node.js + TS + Express + Drizzle ORM)

This document establishes the definitive architecture guidelines for your business management backend. It preserves your exact **7-File Module Pattern** while organizing modules into scalable, domain-grouped folders under `src/modules/`. It describes strict write boundaries, performant reporting reads, naming rules, and a detailed migration plan with TypeScript Path Alias configurations.

---

## 1. Final Recommended Folder Structure

Below is the scaled directory map. Features are grouped into cohesive business domains, ensuring that folder names are strictly **singular** and database tables are strictly **plural**.

```
pos-backend/
├── tsconfig.json                   # Mapped with Path Aliases
├── package.json                    # Operational scripts & ESM subpath mappings
├── app.ts                          # Bootstrap entry point
│
├── src/
│   ├── config/                     # Core configs (e.g. database pool connection)
│   │   └── database.ts             # Drizzle 'db' initializer
│   │
│   ├── shared/                     # Pure Technical Shared Folder (NO business logic)
│   │   ├── middleware/             # globalAuth, validateBody, requestCorrelation
│   │   ├── errors/                 # AppError class, fail(), globalErrorHandler
│   │   ├── logger/                 # Correlation-ID tracked logging system
│   │   ├── utils/                  # terminalColorizer, pricingArithmetic
│   │   └── constants/              # Shared technical values (e.g., PAGINATION_DEFAULTS)
│   │
│   └── modules/                    # The Grouped Domain Monolith
│       ├── schema.ts               # Drizzle schema aggregator for migration syncs
│       ├── routes.ts               # Unified Express API route aggregator
│       │
│       ├── system/                 # Shared Business Building Blocks (Core modules)
│       │   ├── user/               # user.schema.ts, user.service.ts...
│       │   ├── branch/             # branch.schema.ts...
│       │   ├── upload/             # upload.schema.ts...
│       │   └── notification/       # notification.schema.ts...
│       │
│       ├── pos/                    # Brick-and-Mortar cashier operational terminal logic
│       │   ├── order/
│       │   ├── shift/
│       │   ├── table/
│       │   ├── kitchenStation/
│       │   ├── posPoint/
│       │   ├── posSettings/
│       │   ├── payment/            # Cashier register payments (Cash, cards, splits)
│       │   └── bill/               # Cashier receipts & invoicing
│       │
│       ├── catalog/                # Global Product Catalog Descriptions
│       │   ├── item/
│       │   ├── category/
│       │   ├── coupon/
│       │   ├── modifier/           # Product custom options
│       │   └── pricing/            # Promotional pricing schedules
│       │
│       ├── inventory/              # Warehouse Logistics & Stock Auditing
│       │   ├── stock/              # Current stock balance numbers
│       │   ├── stockAdjustment/    # Additions, reductions, inventory counts
│       │   ├── stockLog/           # Historical ledger of every stock change
│       │   └── warehouse/          # Physical building storage locations
│       │
│       ├── purchasing/             # Procurement Pipelines
│       │   ├── supplier/           # Vendor profile registries
│       │   ├── purchaseOrder/      # Procurement requests
│       │   └── goodsReceipt/       # Dock counts of received items
│       │
│       ├── finance/                # General Ledger Double-Entry Booking
│       │   ├── account/            # Chart of financial accounts
│       │   ├── journalEntry/       # Debit/Credit ledger rows (No generic names)
│       │   ├── tax/                # Global VAT and fiscal settings
│       │   ├── expense/            # Corporate operational expenses
│       │   └── installment/        # Installment purchase plans
│       │
│       ├── crm/                    # Customer Management & Retention
│       │   ├── customer/           # Customer records
│       │   └── loyalty/            # Reward systems and rules
│       │
│       ├── hr/                     # Workforce Management
│       │   ├── employee/           # Employment contracts, rates
│       │   ├── attendance/         # Punch records
│       │   ├── payroll/            # Payroll generation logic
│       │   └── leave/              # Request and balance controls
│       │
│       ├── reporting/              # Optimized Read-Heavy Report Summaries
│       │   ├── salesReport/        # salesReport.repository.ts joins multi-domains
│       │   ├── inventoryReport/    # Stock history summaries
│       │   └── financeReport/      # Ledger, Tax, and Profit statements
│       │
│       └── ecommerce/              # Storefront channel integrations
│           ├── cart/               # Web shopping cart records
│           └── checkout/           # Stripe webhooks & web payments
```

---

## 2. Naming Conventions

Consistency guarantees project speed and ease of maintainability.
1.  **Module Folders are Singular**: Folder names must be in singular `camelCase` (e.g. `posPoint`, `stockAdjustment`, `journalEntry`).
2.  **Database Tables are Plural**: Database tables must be in plural `snake_case` (e.g. `orders`, `items`, `pos_points`, `journal_entries`).
    *   *Example*:
        ```typescript
        // modules/finance/journalEntry/journalEntry.schema.ts
        export const journalEntries = pgTable("journal_entries", { ... });
        ```
3.  **File Suffixes**: Every module uses co-located files exactly matching your 7-File pattern:
    *   `[module].schema.ts`
    *   `[module].repository.ts`
    *   `[module].service.ts`
    *   `[module].controller.ts`
    *   `[module].routes.ts`
    *   `[module].validation.ts`
    *   `[module].docs.ts`
4.  **Variable / Instance Exports**: Matches the singular module name in `camelCase` (e.g., `journalEntryService`, `journalEntryRepository`).

---

## 3. Dependency & Interaction Rules

We enforce a simple, unidirectional hierarchy. Framework complexity is completely avoided.

### A. The Direct Flow (Pragmatic Layering)
Within any module, execution moves downwards strictly in this path:
```
Express Router ──► Express Controller ──► Business Service ──► Drizzle Repository ──► Database
```
*   **Controllers** parse incoming payloads and trigger validators. Controllers *only* import their own module's service. Banned: calling repositories directly from controllers.
*   **Services** hold all business rules, orchestration flows, and cross-module commands.
*   **Repositories** hold database access queries. Banned: repository calling another repository directly.

### B. The Write vs. Read Boundary Strategy
*   **Strict Write Boundaries (Service-to-Service)**: To protect business invariants, workflow operations must only communicate via Services.
    *   *Example*: `order.service` calls `stock.service.reduceStock(itemId, quantity)`.
    *   *Prohibited*: `order.service` importing `stock.repository.ts` to deduct stock numbers directly.
*   **Pragmatic Read Boundaries (Joins Allowed)**: Read-heavy reporting queries **ARE** permitted to cross domain boundaries using Drizzle joins. Doing so prevents massive Node.js memory overhead.
    *   *Example*: Inside `salesReport.repository.ts`, it is fully permitted to join the Drizzle schemas of `orders`, `customers`, `items`, and `payments` to fetch a consolidated, unified summary in a single SQL operation.

---

## 4. Module-to-Module Communication (Writes)

For cross-module writes and transactions, we import services directly and pass Drizzle transaction clients down the chain:

### Piping Transaction Context (`tx`)
If an action spans multiple modules (e.g. reserving stock when checking out), open Drizzle's `.transaction()` at the orchestrator Service level and pass the transaction instance (`tx`) as an optional parameter to your sub-services and repositories.

```typescript
// src/modules/pos/order/order.service.ts
import { db } from "@/config/database.js";
import stockService from "@/modules/inventory/stock/stock.service.js";
import orderRepository from "./order.repository.js";

export const orderService = {
  async placeOrder(data) {
    // Open a database transaction
    return await db.transaction(async (tx) => {
      // 1. Persist the order inside this transaction block
      const order = await orderRepository.create(data, tx);

      // 2. Adjust stock levels through the Stock Service, passing the active transaction client 'tx'
      await stockService.reduceStock(data.itemId, data.quantity, tx);

      return order;
    });
  }
};
```

Your repository and service signatures should support an optional `tx` argument. If `tx` is provided, queries run inside the transaction; otherwise, they fall back to the default database pool:
```typescript
// src/modules/pos/order/order.repository.ts
import { db } from "@/config/database.js";
import { orders } from "./order.schema.js";

export const orderRepository = {
  async create(data, tx) {
    const client = tx || db; // Use active transaction client or standard connection pool
    const [row] = await client.insert(orders).values(data).returning();
    return row;
  }
};
```

---

## 5. Shared Folder Organization

The `src/shared/` directory is reserved strictly for **technical, business-agnostic tools**. Under no circumstances should business rules (e.g., tax formulas or user roles) live here.

*   **`src/shared/middleware/`**: Generic HTTP handlers (JWT decoders, Zod body parsers, rate limiters, request loggers).
*   **`src/shared/errors/`**: Unified error templates. Houses the generic `AppError` class, the `fail(message, code)` utility to disrupt operational flows, and the global catch handler.
*   **`src/shared/logger/`**: Winston or Morgan logger setups featuring correlation-IDs.
*   **`src/shared/utils/`**: Generic formatting helpers (currency display setups, cryptographic helper tools).
*   **`src/shared/constants/`**: Pure static variables (e.g. `PAGINATION_LIMIT_DEFAULT = 20`).

---

## 6. How Future eCommerce / Channels Fit In

A common pitfall is merging web consumer logic with corporate staff register code. 
*   **Isolate Presentation**: Keep web consumer checkout operations in `modules/ecommerce/checkout` and cashier register endpoints in `modules/pos/order`. They have completely separate routes, controller validation rules, and authorization middlewares.
*   **Shared Operations**: Both controllers execute operations by calling the shared services inside `modules/catalog/item` (to fetch price details), `modules/inventory/stock` (to register stock allocations), and `modules/pos/bill` (to log tax details).

---

## 7. Migration Plan from Flat Modules to Grouped Modules

Follow this step-by-step path to reorganize your codebase safely:

### Step 1: Configure TypeScript Path Aliases
To avoid deep relative paths like `../../../shared/logger` when moving directories, establish TS Path Aliases.
Update `tsconfig.json` to include `"baseUrl"` and `"paths"` under `"compilerOptions"`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "baseUrl": ".",
    "paths": {
      "@/shared/*": ["src/shared/*"],
      "@/modules/*": ["src/modules/*"],
      "@/config/*": ["src/config/*"]
    },
    ...
  }
}
```

*   **Runtime support**: When running in dev using `tsx` (which you currently do inside `package.json`), path aliases in TS are resolved out-of-the-box natively without any other dependencies.
*   **Production Build (ESM compatibility)**: If you compile using `tsc`, configure Node's native **Subpath Imports** in `package.json` to resolve paths cleanly, or use the `tsconfig-paths` library.

### Step 2: Create the Domain Folders
Create the new domain folders inside `src/modules/`:
```bash
mkdir src/modules/system src/modules/pos src/modules/catalog src/modules/inventory src/modules/finance src/modules/crm
```

### Step 3: Move Modules to New Grouped Domains
Move your current folders to their new locations:
1.  **`user`**, **`branch`**, **`upload`** ──► Move to `src/modules/system/`
2.  **`order`**, **`shift`**, **`table`**, **`posPoint`**, **`posSettings`**, **`payment`**, **`bill`** ──► Move to `src/modules/pos/`
3.  **`item`**, **`category`**, **`coupon`** ──► Move to `src/modules/catalog/`
4.  **`customer`** ──► Move to `src/modules/crm/`

### Step 4: Convert Imports to Path Aliases
Convert your imports to clean path mappings. This makes moving files completely pain-free:
*   *Old*: `import { db } from "../../config/database.js"`
*   *New*: `import { db } from "@/config/database.js"`
*   *Old*: `import customerService from "../customer/customer.service.js"`
*   *New*: `import customerService from "@/modules/crm/customer/customer.service.js"`

### Step 5: Update Drizzle Schema Aggregator (`src/modules/schema.ts`)
Update this file to re-export Drizzle tables from the new locations:
```typescript
export * from "./system/user/user.schema.js";
export * from "./system/branch/branch.schema.js";
export * from "./pos/order/order.schema.js";
export * from "./pos/payment/payment.schema.js";
export * from "./catalog/item/item.schema.js";
export * from "./crm/customer/customer.schema.js";
```

### Step 6: Update Central Routing Aggregator (`src/modules/routes.ts`)
Mount your routers from their updated paths:
```typescript
import { Router } from "express";
import userRouter from "@/modules/system/user/user.routes.js";
import orderRouter from "@/modules/pos/order/order.routes.js";
import itemRouter from "@/modules/catalog/item/item.routes.js";

const router = Router();

router.use("/users", userRouter);
router.use("/orders", orderRouter);
router.use("/items", itemRouter);

export default router;
```

---

## 8. Node.js + Express + Drizzle ORM Recommendations

1.  **Preventing Idle Database Pool Crashes**:
    Since you use Neon/Supabase PostgreSQL serverless pools, handle the pool error event inside `src/config/database.ts` so idle client disconnects don't terminate your Express process:
    ```typescript
    pool.on("error", (err: Error) => {
      console.error("[DB POOL ERROR] Idle client disconnected:", err.message);
    });
    ```
2.  **Modular Schema Push / Studio**:
    Ensure your `drizzle.config.js` points directly to the central aggregator `src/modules/schema.ts` so migrations generate automatically across all business directories:
    ```javascript
    export default {
      schema: "./src/modules/schema.ts",
      out: "./src/db/migrations",
      dialect: "postgresql",
    };
    ```
3.  **Strict Transaction Checks**:
    Always enforce that the transaction `tx` argument inside your repositories and services is named uniformly (e.g., `tx?: any`). Banish implicit transaction calls inside loops.

---

## 9. Anti-Patterns to Avoid

| Anti-Pattern | Operational Damage | Practical Solution |
| :--- | :--- | :--- |
| **Direct Joins on Writes** | Merging schemas directly inside a transaction or modifying multiple module tables in one Drizzle statement. | Perform writes by calling the designated module services in order. |
| **Anemic Services** | Creating blank Services that just forward arguments to Repositories, moving Zod validates or calculations into Controllers. | Controllers should strictly translate HTTP data. Services must handle all logic, validations, and mapping operations. |
| **Technical Folder Split** | Re-creating global directories like `src/controllers/` or `src/services/` inside the modules. | Keep all 7 files co-located inside the singular module folder (`order/`). |
| **"System" as a Junk Drawer** | Placing random calculation helpers, coupon logic, or stock updates in the `system/` directory. | Keep `system/` strictly for shared operational business modules (users, branches, logs). Domain rules go to their specific folders. |
