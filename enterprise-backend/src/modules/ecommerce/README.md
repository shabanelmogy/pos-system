# eCommerce Domain

Manages digital storefront channel integrations including web shopping carts
and online checkout flows.

## Planned Modules

| Module | Responsibility |
| :--- | :--- |
| `cart` | Web guest/customer shopping cart records |
| `checkout` | Online payment gateway webhooks (Stripe, PayPal, etc.) |

## Architectural Rules
- **Channel isolation**: eCommerce controllers are fully separate from `pos/order` controllers.
  They use different routes, validation schemas, and auth middlewares.
- **Shared services**: Both channels call the same underlying services:
  - `catalog/item.service` for pricing
  - `inventory/stock.service` for stock reservation
  - `crm/customer.service` for customer profiles
  - `pos/bill.service` for invoice generation
