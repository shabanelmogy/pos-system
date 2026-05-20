# HR Domain

Manages workforce profiles, attendance tracking, payroll cycles, and leave requests.

## Planned Modules

| Module | Responsibility |
| :--- | :--- |
| `employee` | Employment contracts, roles, salary rates |
| `attendance` | Daily punch records and time tracking |
| `payroll` | Monthly payslip generation, deductions, bonuses |
| `leave` | Leave request submissions and approval workflows |

## Communication Rules
- **Reads system/user**: `employee.service` may reference `system/user` for authentication linkage.
- **Self-contained writes**: Payroll and attendance records are owned exclusively by this domain.
