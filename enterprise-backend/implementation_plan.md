# Modules Reference Creation Plan

The goal is to create a comprehensive reference markdown file (`README.md`) within the `api/src/modules` directory. This file will document the overall architecture of the `modules` directory and provide a detailed blueprint based on the `applications` module for creating new modules.

## Proposed Changes

### Global Modules Structure

#### [NEW] [README.md](file:///g:/Test/ticket_managementsystem/api/src/modules/README.md)
Create a markdown file containing:
- **Directory Hierarchy**:
    - Explanation of the `api/src/modules` structure.
    - Centralization of logic in feature-based folders.
- **Registration Process**:
    - **Routing**: How to add the new module to `modules/routes.js` and how it gets mounted under `/api/v1` via `src/routes/index.js`.
    - **Database**: How to export tables in `modules/schema.js` to ensure they are picked up by the ORM/migrations.
- **The 7-File Module Pattern**:
    - **`*.schema.js`**: Defining tables with Drizzle ORM, using UUIDs, and proper tenant relationships.
    - **`*.repository.js`**: Encapsulating all Drizzle queries, ensuring no business logic leaks into this layer. Support for `ILIKE` search and pagination.
    - **`*.service.js`**: The orchestration layer. Business logic, input validation, and calling the repository. Use of `fail(msg, status)` for clean error throwing.
    - **`*.controller.js`**: Handling HTTP requests, extracting `req.tenantScope`, and passing data to services. Centralized error handling via `handleError(res, e, context)`.
    - **`*.routes.js`**: Defining endpoints, applying `authenticateToken`, and enforcing tenant scope via `enforceTenantScope` or `requireTenantScopeMiddleware`.
    - **`*.validation.js`**: Zod schemas for `POST` and `PUT` request bodies.
    - **`*.docs.js`**: Swagger JSDoc for automated API documentation.
- **Drizzle ORM Implementation**:
    - **Configuration**: Overview of `drizzle.config.js` (PostgreSQL dialect, schema location, migrations path).
    - **Database Connection**: Explanation of `api/src/config/database.js`.
    - **Common Patterns**: Using `sql` templates, `ILIKE`, `countDistinct`, and transactions.
    - **Schema Aggregation**: Importance of `modules/schema.js` for migrations and ORM discovery.
- **Database Scripts Reference**:
    - Detailed explanation of `npm run db:*` scripts:
        - `db:generate`: Generating migration files.
        - `db:push`: Syncing schema directly to the DB (dev only).
        - `db:migrate`: Applying generated migrations.
        - `db:studio`: Launching the Drizzle GUI.
        - `db:seed`: Running seeding scripts.
        - `db:reset`: Full database wipe, sync, and re-seed.
- **Multi-Tenancy Scoping Strategies**:
    - **Strict Scoping**: Used when a resource *must* belong to a tenant (e.g., creating an application). Enforced via `requireTenantScopeMiddleware`.
    - **Optional/Hybrid Scoping**: Used when a resource can be viewed globally or across all tenants (e.g., super-admin view). Enforced via `enforceTenantScope`.
    - **Implementation Pattern**: How to handle the `tenantId ? eq(...) : undefined` pattern in repositories to support both scoped and unscoped queries.
- **Common Utilities**:
    - Pagination helper usage (`parsePaginationParams`, `buildPaginatedResponse`).
    - Standardized response patterns (e.g., 200 OK for updates, 201 Created for insertions).

## Verification Plan

### Manual Verification
- Review the generated `README.md` to ensure it accurately covers both the global registration and the individual module patterns.
- Cross-reference with `applications` and `tickets` modules to ensure consistency.
