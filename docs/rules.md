# Development Rules & Standards

To ensure consistency and high quality across the POS system, all future development must strictly adhere to these global rules.

---

## 1. Localization (i18n)
- **Rule**: NEVER use hardcoded strings for UI labels.
- **Action**: Always add new keys to `pos-frontend/src/features/[feature]/i18n/en.json` and `ar.json`.
- **Implementation**: Use the `t()` hook from `react-i18next`.

## 2. Design System & Color Theme
- **Rule**: Use existing CSS variables for all styling to maintain the "Glassmorphism" premium look.
- **Variables**:
  - Backgrounds: `var(--bg-main)`, `var(--bg-card)`, `var(--bg-card-alt)`
  - Text: `var(--text-main)`, `var(--text-muted)`, `var(--text-dim)`
  - Accent: `var(--primary)`
- **Rule**: Use `framer-motion` for all transitions and hover effects.

## 3. Feature-Based Architecture
- **Rule**: Follow the established directory structure:
  - `src/features/[feature_name]/components`
  - `src/features/[feature_name]/api`
  - `src/features/[feature_name]/i18n`
- **Action**: Keep business logic in custom hooks and UI in focused components.

## 4. Routing & Navigation
- **Rule**: When adding a new "Page", ensure it is registered in the main router or the relevant feature's sub-tab system (e.g., `Dashboard.tsx` tabs).
- **Rule**: Ensure sidebar/navigation links are updated to include the new destination.

## 5. "Real-Time" Data Persistence
- **Standard (Polling)**: For Admin Dashboards and Management (Shortage, Metrics), use TanStack Query's `refetchInterval`.
  - **Interval**: 10 seconds (`10000ms`) is the default.
  - **Action**: Always include a "Live" pulsing indicator.
- **Critical (WebSockets)**: For time-sensitive operational screens (KDS, Printing), use **Socket.io** for sub-second delivery.
  - **Note**: Only introduce Socket.io if the feature requires <2 second latency.

---

## 6. Backend Repository Pattern
- **Rule**: Keep all database logic in `repository.js` files using Drizzle ORM.
- **Rule**: Controllers should only handle request parsing and response formatting, delegating logic to the Service layer.

## 7. Precise Filtering
- **Rule**: All history and analytics queries must strictly use IDs (e.g., `customerId`, `branchId`) rather than ambiguous strings like names or phone numbers.
