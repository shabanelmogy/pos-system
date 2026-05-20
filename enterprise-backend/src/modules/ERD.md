# Restaurant POS System - Entity Relationship Diagram (ERD)

This document provides a visual representation and detailed description of the backend database schema, with a focus on Role-Based Access Control (RBAC) implementation.

## Database Schema (Mermaid Diagram)

```mermaid
erDiagram
    BRANCHES ||--o{ USERS : "has"
    BRANCHES ||--o{ POS_POINTS : "contains"
    BRANCHES ||--o{ SHIFTS : "has"
    BRANCHES ||--o{ ORDERS : "manages"

    USERS ||--o{ USER_POS_PERMISSIONS : "assigned to"
    USERS ||--o{ SHIFTS : "operates"
    USERS ||--o{ ORDERS : "creates"

    POS_POINTS ||--o{ USER_POS_PERMISSIONS : "accessed by"
    POS_POINTS ||--o{ SHIFTS : "hosts"
    POS_POINTS ||--o{ ORDERS : "processes"
    POS_POINTS ||--|| POS_SETTINGS : "configured by"

    SHIFTS ||--o{ ORDERS : "contains"

    ORDERS ||--o{ ORDER_ITEMS : "includes"
    ORDERS ||--o| TABLES : "at"
    ORDERS ||--o| CUSTOMERS : "for"
    ORDERS ||--|| BILLS : "generates"

    ORDER_ITEMS ||--|| ITEMS : "refers to"

    ITEMS }o--|| CATEGORIES : "belongs to"

    USERS {
        uuid id PK
        string name
        string email
        string role "admin | manager | cashier"
        uuid branch_id FK
    }

    USER_POS_PERMISSIONS {
        uuid id PK
        uuid user_id FK
        uuid pos_point_id FK
    }

    BRANCHES {
        uuid id PK
        string name
        string code
    }

    POS_POINTS {
        uuid id PK
        uuid branch_id FK
        string name
        string code
    }

    POS_SETTINGS {
        uuid id PK
        uuid pos_point_id FK
        boolean allow_discounts
        boolean enable_tables
    }

    SHIFTS {
        uuid id PK
        uuid cashier_id FK
        uuid pos_point_id FK
        uuid branch_id FK
        timestamp start_time
        timestamp end_time
    }

    ORDERS {
        uuid id PK
        uuid cashier_id FK
        uuid pos_point_id FK
        uuid branch_id FK
        uuid table_id FK
        uuid customer_id FK
        string status
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid item_id FK
        integer quantity
        decimal price
    }

    ITEMS {
        uuid id PK
        uuid category_id FK
        string name
        decimal price
    }

    CATEGORIES {
        uuid id PK
        string name
    }

    TABLES {
        uuid id PK
        string name
    }

    CUSTOMERS {
        uuid id PK
        string name
        string phone
    }

    BILLS {
        uuid id PK
        uuid order_id FK
        decimal total_amount
    }
```

## RBAC Implementation Details

The current schema supports RBAC through several key fields and tables:

### 1. User Roles
- **Table:** `users`
- **Field:** `role`
- **Values:** Currently defined as `admin`, `manager`, or `cashier`.
- **Scope:** 
    - `admin`: Global access (usually `branch_id` is null).
    - `manager`: Access to specific branch data.
    - `cashier`: Limited to creating orders and managing their own shifts.

### 2. POS-Level Permissions
- **Table:** `user_pos_permissions`
- **Purpose:** Maps specific `users` to specific `pos_points`. 
- **Use Case:** Even if a user is a `cashier` in a branch, they may only be allowed to log into specific terminals (e.g., "Main Counter" but not "Bar Terminal").

### 3. Branch Isolation
- **Field:** `branch_id` (present in `users`, `pos_points`, `shifts`, `orders`, etc.)
- **Purpose:** Ensures data isolation between different restaurant branches. 
- **RBAC Rule:** Users (except global admins) should only be able to see/modify data associated with their `branch_id`.

### 4. Shift-Based Access
- **Table:** `shifts`
- **Purpose:** Tracks when a `cashier` is active.
- **RBAC Potential:** Orders and cash operations can be restricted to users with an active shift on a specific `pos_point`.

## Key Relationships for RBAC Logic

- **User -> Branch:** Determines the data partition the user can access.
- **User -> Role:** Determines the actions (CRUD) the user can perform.
- **User -> POS Point (via user_pos_permissions):** Determines which hardware/terminal the user can operate.
- **Order -> Cashier/POS/Branch:** Provides audit trails for permission-based actions.
