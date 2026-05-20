# Current Codebase Structure & Architectural Mapping
## POS Backend System (Node.js + TypeScript + PostgreSQL + Drizzle ORM)

This document provides a complete technical map of the current **POS Backend System** codebase. It outlines the directories, configuration files, business modules, and maps them to the established architectural patterns.

---

## 1. Directory Tree Overview

Below is the complete physical folder and file structure of the `pos-backend` workspace:

```
pos-backend/
├── .env                            # Local environment configuration
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore patterns
├── app.ts                          # Express application entry & self-healing bootstrap
├── drizzle.config.js               # Drizzle Kit CLI configuration
├── package.json                    # Project dependencies & operational scripts
├── tsconfig.json                   # TypeScript compiler rules
├── web.config                      # IIS hosting configurations (if deploying to Windows)
│
├── config/                         # Root environment and global configuration
│   └── config.ts                   # Environment variables typing & defaults
│
├── scripts/                        # Database management & seed scripts
│   ├── check-coupons.ts
│   ├── check-users.ts
│   ├── migrate.ts                  # Multi-schema migration seed executor
│   ├── populate-settings.ts
│   ├── reset-admin.ts
│   ├── reset-db.ts                 # Database reset executor
│   ├── seed-enterprise.ts
│   └── test-connection.ts          # Postgres pool connectivity validator
│
└── src/                            # Main Application Codebase
    ├── app.ts                      # Application bootstrapping wrapper
    │
    ├── config/                     # Core system configurations
    │   └── database.ts             # Drizzle client, pool options, & pool error hooks
    │
    ├── db/                         # Database migrations
    │   ├── migrate.ts              # Migration runtime runner
    │   └── migrations/             # Automatically generated SQL migration files
    │
    ├── types/                      # Application-wide TypeScript type declarations
    │
    ├── utils/                      # Common/Shared system utilities (NO business logic)
    │   ├── errorHandler.ts         # Generic application error wrapper & fail utility
    │   ├── events.ts               # Core EventEmitter utilities
    │   ├── logger.ts               # Correlation-ID tracked logging system
    │   ├── pricingService.ts       # Shared arithmetic calculation engine
    │   ├── socket.ts               # Socket.io connection manager
    │   ├── terminalColorizer.ts    # Custom console print colorizer
    │   └── i18n/                   # Multi-language translation support
    │
    └── modules/                    # The Modular Domain Monolith Core
        ├── README.md               # Folder-level architectural blueprint
        ├── ERD.md                  # Entity Relationship Diagram specs
        ├── schema.ts               # Unified Drizzle schema aggregator for migration syncs
        ├── routes.ts               # Unified Express API route aggregator
        │
        ├── bill/                   # Bill & Invoicing module
        ├── branch/                 # Multi-branch physical shop module
        ├── category/               # Product category catalog module
        ├── coupon/                 # Discount, promo, & loyalty codes module
        ├── customer/               # Customer analytics & profile module
        ├── item/                   # Menu items, modifier, & inventory descriptor module
        ├── kitchenStation/         # Kitchen display station (KDS) module
        ├── order/                  # POS transaction, order, & kitchen station dispatcher
        ├── payment/                # Integrated payments gateway module
        ├── posPoint/               # Specific POS cash register & terminals module
        ├── posSettings/            # Custom terminal configurations module
        ├── shift/                  # Cashier daily shifts, sessions, & drawer audits module
        ├── table/                  # Diners seating layout & table assignments module
        ├── upload/                 # Media assets and receipt uploads controller
        └── user/                   # Users, cashiers, POS permissions, & role access module
```

---

## 2. The 7-File Module Pattern

Each module inside `src/modules/` adheres to a strict feature-based encapsulating pattern. This keeps related code files co-located rather than scattering them across global project layers.

| File Path Template | Layer Role | Responsibility |
| :--- | :--- | :--- |
| **`*.schema.ts`** | Infrastructure | Defines Drizzle ORM PostgreSQL table structures, indexes, and relations. |
| **`*.repository.ts`** | Infrastructure | Handles queries, updates, and direct data manipulation. Encapsulates Drizzle logic from services. |
| **`*.service.ts`** | Application | Core business logic layer. Coordinates calls to repositories and other module services. |
| **`*.controller.ts`** | Presentation | Handles Express `Request` and `Response` lifecycle, status codes, and translation calls. |
| **`*.routes.ts`** | Presentation | Exposes REST endpoints and binds them to specific controller methods. |
| **`*.validation.ts`** | Presentation | Strict schema-validation rules using Zod (validates incoming HTTP request body/query). |
| **`*.docs.ts`** | Presentation | OpenAPI/Swagger documentation schema definitions. |

---

## 3. Current Module Overview & Responsibilities

The current modules are divided into distinct business domains:

1. **`user`**: Handles credentials, POS points clearance, branch associations, and access roles (`cashier`, `admin`, `waiter`, `kitchen`).
2. **`customer`**: Tracks customers, loyalty phone records, transaction statistics (e.g., `totalSpent`, `totalOrders`), and order histories.
3. **`branch`**: Represents physical business venues in a multi-tenant or multi-outlet setup.
4. **`posPoint`**: Models cashier terminals, register endpoints, and local cash boxes.
5. **`posSettings`**: Stores printer, network, and layout preferences per physical hardware terminal.
6. **`shift`**: Audit trails for cashier logins, starting drawer cash balances, actual vs expected cash tallies, and closures.
7. **`table`**: Diners seating layout tracking, guest capacity, and state flags (`OCCUPIED`, `VACANT`).
8. **`category`**: Nested classification tags for menu items.
9. **`item`**: Catalog catalog containing product items, pricing models, raw cost items, inventory links, and customization options (modifiers).
10. **`kitchenStation`**: Coordinates categories mapped to dedicated chef screens (e.g., hot kitchen vs bar).
11. **`order`**: Orchestrates ordered dishes, order types (`DINE_IN`, `TAKEAWAY`, `DELIVERY`), modifications, pricing computations, statuses, and history logs.
12. **`bill`**: Standardized invoicing records, tax percentages, custom charges, and print formats.
13. **`payment`**: Tracks currency payments, external gateway callbacks (e.g. Razorpay), split bills, and cash details.
14. **`coupon`**: Holds custom promo details, percentage or fixed discount formulas, minimum values, and expiry rules.
15. **`upload`**: Image files uploading and receipt rendering module.

---

## 4. Key Orchestration Files

*   **`src/modules/schema.ts`**:
    Imports every individual module `.schema.ts` file, links relationship functions (`relations`), and exports a unified state representation. Drizzle uses this single file to generate automatic SQL migration steps.
*   **`src/modules/routes.ts`**:
    Registers each module's router under a unified Express route mapping mounted under the base `/api` route.
*   **`src/config/database.ts`**:
    Establishes the Postgres client pooling instance (`pg.Pool`), maps idle timeout connection rules, handles graceful Neon DB connection drop recover hooks, and binds the Drizzle ORM entity (`db`).
*   **`src/utils/errorHandler.ts`**:
    Maintains a simple runtime error handling system. Contains:
    *   `fail(message, status)`: Emits standard format App Errors to halt request executions immediately.
    *   `handleError(res, error, context)`: Catches errors (including Zod validation schemas) and sends standard JSON errors.
