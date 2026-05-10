# Modules Directory Architecture

This directory follows a feature-based modular structure. Each module encapsulates its own schema, repository, service, controller, and routes.

## The 7-File Module Pattern

1.  **`*.schema.js`**: Defines the database table using Drizzle ORM.
2.  **`*.repository.js`**: Handles direct database queries. Encapsulates all Drizzle-specific logic.
3.  **`*.service.js`**: Orchestration layer. Contains business logic and calls repositories.
4.  **`*.controller.js`**: Handles HTTP request/response logic.
5.  **`*.routes.js`**: Defines the module's API endpoints.
6.  **`*.validation.js`**: Request body validation using Zod.
7.  **`*.docs.js`**: Swagger/OpenAPI documentation for the module.

## Registration

### Routing
All module routes must be registered in `src/modules/routes.js` to be mounted under `/api`.

### Database
All module schemas must be exported in `src/modules/schema.js` to be detected by Drizzle migrations.

## Database Scripts

- `npm run db:generate`: Generate migration files from schema changes.
- `npm run db:push`: Push schema changes directly to the database (use for dev).
- `npm run db:migrate`: Run generated migrations.
- `npm run db:studio`: Open Drizzle Studio to view/edit data.
