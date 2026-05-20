# Dynamic Database Content Localization Plan

To support multi-language data for user-generated content (like Items and Categories), we need to update the database schema, API validations, and the frontend rendering logic.

## Goal
Store names and descriptions in both English and Arabic, and allow the frontend to display the correct language based on the user's active locale.

## Proposed Entities for Localization
We will localize the following entities:
1. **Category**: `name`
2. **Item**: `name`, `description`
3. **Item Modifier**: `name`
4. **Kitchen Station**: `name`
5. **Branch**: `name`
6. **POS Point**: `name`

## Architectural Approach Options

**Please select your preferred database design approach:**

### Option A: Explicit Columns (Recommended for simplicity & type safety)
We rename existing `name` columns to `nameEn` and add `nameAr` (e.g., `descriptionEn`, `descriptionAr`). 
- **Pros**: Easy to query, simple unique constraints (e.g., `nameEn` is unique), perfect TypeScript safety.
- **Cons**: Adding a 3rd language (e.g., French) later requires another database migration.

### Option B: JSONB Columns
We change `name` to a `jsonb` column that stores an object like `{ "en": "Burger", "ar": "برجر" }`.
- **Pros**: Highly scalable. Adding a 3rd language requires zero database changes.
- **Cons**: Harder to enforce unique constraints (requires custom SQL indexes), slightly more complex queries.

## Execution Steps

### 1. Database Schema Updates
- Update Drizzle schemas (`.schema.ts`) across the relevant modules based on the chosen option.
- Generate and run the Drizzle migrations (existing `name` values will be mapped to the English field to prevent data loss).

### 2. Validation & API Updates
- Update Zod schemas (`.validation.ts`) to require the localized fields when creating/updating records.
- Update the Swagger documentation (`.docs.ts`) to reflect the new payloads.
- Update Services to handle the new localized payload structure.

### 3. Frontend Integration
- Update the frontend TypeScript interfaces (e.g., `Category`, `Item`) to match the new backend structure.
- Create a global helper function or React hook on the frontend to automatically extract the correct language from the data object based on `i18n.language` (e.g., `localize(item, 'name')`).
- Update the UI components (Menu, Settings, etc.) to use this helper.
