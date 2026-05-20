# Finance Domain

Manages general ledger bookkeeping, tax compliance, expenses, and installment plans.

## Planned Modules

| Module | Responsibility |
| :--- | :--- |
| `account` | Chart of financial accounts (assets, liabilities, equity, income, expenses) |
| `journalEntry` | Double-entry debit/credit ledger rows |
| `tax` | VAT, fiscal settings, and tax rate configurations |
| `expense` | Operational business expense records |
| `installment` | Installment purchase plan management |

## Communication Rules
- **Receives from POS**: `journalEntry.service` is called by `pos/bill.service` after invoice generation.
- **No direct POS writes**: Finance never writes directly to POS tables.

## Naming Note
Use `journalEntry` (not `transaction`) to avoid generic naming confusion with database transactions.
