# Shared Technical Utilities

This directory contains ONLY pure technical, business-agnostic shared code.

## Rules
- ✅ Generic HTTP middleware (JWT, rate limiters, correlation IDs)
- ✅ Error formatting utilities (AppError, fail(), globalErrorHandler)
- ✅ Logging infrastructure (Winston, Morgan)
- ✅ Pure math/format helpers (currency display, crypto utils)
- ✅ Static constants (PAGINATION_LIMIT_DEFAULT, etc.)
- ❌ Business rules (tax calculations, role validations, inventory logic)
- ❌ Domain entities or service logic of any kind

## Structure

```
shared/
  middleware/    # HTTP-level middleware (auth guards, body parsers, rate limiters)
  errors/        # AppError class, fail(), globalErrorHandler
  logger/        # Correlation-ID tracked logging setup
  utils/         # Pure formatting and math helpers
  constants/     # Static system-wide constants
```
