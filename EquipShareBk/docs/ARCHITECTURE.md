# EquipShare Backend — Architecture Guide

> Node.js + Express.js + MongoDB  
> Designed for clarity, scalability, and team consistency — not a .NET port, not undisciplined.

---

## Core Philosophy

Node.js is not .NET — but good engineering principles still apply.

| Concern      | .NET Approach                 | Node.js Approach (this project)        |
| ------------ | ----------------------------- | -------------------------------------- |
| Structure    | Clean Architecture (4 layers) | 3-Layer + Feature Modules              |
| Dispatch     | CQRS / MediatR                | Direct service calls                   |
| Validation   | FluentValidation pipeline     | Zod schemas per route                  |
| ORM          | EF Core + Unit of Work        | Mongoose + sessions                    |
| DI container | Built-in ASP.NET DI           | Module-level singletons (no container) |
| Error flow   | Result\<T\> pattern           | Custom AppError + middleware           |

The goal is **simplicity with discipline** — no over-engineering, no framework magic.

### Design Principles

1. Feature-first (vertical slicing)
2. Strict separation inside each feature
3. No unnecessary abstractions
4. Convention over configuration
5. Architecture enforced by structure + patterns, not docs alone

---

## Architecture: 3-Layer Feature-Based

```
src/
├── config/
├── modules/          ← vertical feature slices
│   ├── auth/
│   ├── users/
│   ├── equipment/
│   └── ...
├── shared/
│   ├── errors/
│   ├── middleware/
│   ├── types/
│   └── utils/
├── app.ts            ← Express app setup
└── server.ts         ← HTTP server entry point
```

### Request Flow

```
HTTP Request
     │
     ▼
Router → Controller → Service → Repository → Database
```

### Layer Responsibilities

| Layer      | Responsibility                         |
| ---------- | -------------------------------------- |
| Router     | Routes + middleware (auth, validation) |
| Controller | HTTP ↔ Service translation ONLY        |
| Service    | All business logic                     |
| Repository | Database access ONLY                   |

**Why no CQRS / MediatR equivalent?**  
MediatR in .NET solves fat controllers via a pipeline. In Node.js, the module system + middleware already solves this cleanly. Adding a CQRS bus would be indirection without benefit for most APIs.

---

## Project Structure (Full)

```
src/
│
├── config/
│   ├── env.ts              # Validates & exports all env vars via Zod
│   ├── database.ts         # Mongoose connection setup
│   └── app.ts              # Express app factory (middleware registration)
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.routes.ts        # POST /api/auth/login, /register, /refresh, ...
│   │   ├── auth.controller.ts    # req/res handling
│   │   ├── auth.service.ts       # login logic, token generation, refresh rotation
│   │   ├── auth.repository.ts    # DB queries for User + RefreshToken
│   │   ├── auth.schema.ts        # Mongoose User & RefreshToken schemas
│   │   ├── auth.dto.ts           # TypeScript types for inputs/outputs
│   │   └── auth.validation.ts    # Zod schemas for request body validation
│   │
│   ├── users/
│   │   ├── users.routes.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── users.schema.ts
│   │   ├── users.dto.ts
│   │   └── users.validation.ts
│   │
│   ├── equipment/
│   │   └── ...                   # same structure as above
│   │
│   └── index.ts                  # registers all module routers onto the Express app
│
├── shared/
│   │
│   ├── errors/
│   │   ├── AppError.ts           # Base custom error class with statusCode + code
│   │   └── errorCodes.ts         # Enum of all application error codes
│   │
│   ├── middleware/
│   │   ├── authenticate.ts       # JWT verification middleware
│   │   ├── authorize.ts          # Role-based access control middleware
│   │   ├── validate.ts           # Zod validation middleware factory
│   │   ├── errorHandler.ts       # Global Express error handler (4-arg)
│   │   └── notFound.ts           # 404 catch-all handler
│   │
│   ├── utils/
│   │   ├── asyncHandler.ts       # Wraps async route handlers — eliminates try/catch
│   │   ├── apiResponse.ts        # Standardized response envelope factory
│   │   └── pagination.ts         # Reusable pagination helper for Mongoose queries
│   │
│   └── types/
│       ├── express.d.ts          # Augments Express Request with `user` property
│       └── pagination.ts         # PaginationMeta type
│
├── app.ts
└── server.ts
```

---

## Module Anatomy

Each module is **self-contained**. Every file has one responsibility.

### `auth.routes.ts`

```ts
import { Router } from "express";
import { authenticate } from "@shared/middleware/authenticate";
import { validate } from "@shared/middleware/validate";
import { loginSchema, registerSchema } from "./auth.validation";
import * as controller from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.me);

export default router;
```

### `auth.controller.ts`

```ts
// Controllers have ONE job: translate HTTP ↔ service.
// No business logic. No direct DB access.
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(ApiResponse.success(result, "Logged in successfully"));
});
```

### `auth.service.ts`

```ts
// All business logic lives here.
// Throws AppError for expected failures — no manual status code juggling.
export const login = async (dto: LoginDto) => {
  const user = await authRepository.findByEmail(dto.email);
  if (!user)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const accessToken = tokenService.signAccess(user);
  const refreshToken = await tokenService.createRefreshToken(user._id);
  return { accessToken, refreshToken };
};
```

### `auth.repository.ts`

```ts
// Only Mongoose queries here. Zero business logic.
export const findByEmail = (email: string) =>
  UserModel.findOne({ email }).select("+passwordHash");

export const createUser = (data: CreateUserDto) => UserModel.create(data);
```

---

## Architecture Rules (Enforced)

### Controller Rules

- NO business logic
- NO direct DB access
- Only calls service, handles req/res

```ts
// correct controller — nothing more
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(ApiResponse.success(result, "Logged in successfully"));
});
```

### Service Rules

- ALL business logic lives here
- NO Express objects (`req`, `res`, `next`)
- NO HTTP status code decisions
- Throws `AppError` for expected failures

```ts
export const login = async (dto: LoginDto) => {
  const user = await authRepository.findByEmail(dto.email);
  if (!user)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid)
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const accessToken = tokenService.signAccess(user);
  const refreshToken = await tokenService.createRefreshToken(user._id);
  return { accessToken, refreshToken };
};
```

### Repository Rules

- ONLY Mongoose queries — no logic, no HTTP knowledge
- No `throw AppError` here — let queries return `null`, service decides

```ts
export const findByEmail = (email: string) =>
  UserModel.findOne({ email }).select("+passwordHash");
```

> **Golden Rule:** If you need to think "where should this go?" — it belongs in **service**.

### Import Discipline

Forbidden — controller importing a model directly:

```ts
// BAD: skips the repository layer
import { UserModel } from "./auth.schema";
```

Correct:

```ts
// GOOD: controller only knows the service
import * as authService from "./auth.service";
```

### PR Checklist

Every PR must verify before merge:

- [ ] No business logic in controllers
- [ ] No DB access outside repository files
- [ ] Validation applied at route level (Zod middleware)
- [ ] All expected failures throw `AppError`
- [ ] All responses use `ApiResponse`
- [ ] New env vars added to `config/env.ts` schema

---

## Error Handling Strategy

**Throw, don't return.** Services throw `AppError`; the global middleware catches everything.

```ts
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string, // e.g. 'NOT_FOUND', 'CONFLICT', 'UNAUTHORIZED'
    public isOperational = true, // false = programmer error → 500
  ) {
    super(message);
  }
}
```

```ts
// shared/middleware/errorHandler.ts — registered last in app.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError && err.isOperational) {
    return res
      .status(err.statusCode)
      .json(ApiResponse.error(err.message, err.code));
  }
  // Unexpected error — log it, return generic 500
  logger.error(err);
  res
    .status(500)
    .json(ApiResponse.error("Internal server error", "SERVER_ERROR"));
};
```

```ts
// shared/utils/asyncHandler.ts — eliminates try/catch in every controller
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

Error types used in services:

| Scenario                   | Code                      | HTTP |
| -------------------------- | ------------------------- | ---- |
| Entity not found           | `NOT_FOUND`               | 404  |
| Duplicate / already exists | `CONFLICT`                | 409  |
| Business rule violated     | `BUSINESS_RULE_VIOLATION` | 422  |
| Not authenticated          | `UNAUTHORIZED`            | 401  |
| Not allowed                | `FORBIDDEN`               | 403  |
| Invalid input              | `VALIDATION_ERROR`        | 400  |

---

## Validation Strategy

Use **Zod** at the route boundary. Validate once, trust everywhere inside.

```ts
// shared/middleware/validate.ts
export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json(ApiResponse.validationError(errors));
    }
    req.body = result.data; // replace with parsed+stripped data
    next();
  };
```

```ts
// auth.validation.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

---

## Standardized API Response

Every endpoint returns the same shape.

```ts
// shared/utils/apiResponse.ts
export const ApiResponse = {
  success: <T>(data: T, message = "Success", meta?: PaginationMeta) => ({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  }),
  error: (message: string, code: string) => ({
    success: false,
    message,
    code,
    data: null,
  }),
  validationError: (errors: Record<string, string[] | undefined>) => ({
    success: false,
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    errors,
    data: null,
  }),
};
```

Example response:

```json
{
  "success": true,
  "message": "Equipment fetched successfully",
  "data": [ ... ],
  "meta": { "total": 120, "page": 2, "limit": 20, "totalPages": 6 }
}
```

---

## Authentication: JWT + Refresh Tokens

Same dual-token strategy as your .NET project — adapted to Node.js conventions:

- **Access token**: JWT, short-lived (15–30 min), signed with `HS256`
- **Refresh token**: opaque random token, stored in MongoDB with expiry, sent as `HttpOnly; Secure; SameSite=Strict` cookie

```ts
// authenticate.ts middleware
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new AppError("No token provided", 401, "UNAUTHORIZED");

  const payload = tokenService.verifyAccess(token); // throws if invalid/expired
  req.user = payload;
  next();
});
```

Token rotation on every refresh: old refresh token is invalidated, new one issued.

---

## MongoDB / Mongoose Conventions

### Schema definition

```ts
// Each schema in its own module-level file
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }, // adds createdAt, updatedAt automatically
);

export const UserModel = model<IUser>("User", userSchema);
```

### Mongoose sessions for multi-document transactions

```ts
// For operations that must be atomic (e.g., create booking + update equipment status)
const session = await mongoose.startSession();
session.startTransaction();
try {
  await BookingModel.create([bookingData], { session });
  await EquipmentModel.findByIdAndUpdate(
    id,
    { isAvailable: false },
    { session },
  );
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

### Indexing

Always define indexes in the schema, not manually:

```ts
userSchema.index({ email: 1 });
equipmentSchema.index({ category: 1, isAvailable: 1 });
equipmentSchema.index({ name: "text", description: "text" }); // full-text search
```

---

## Environment Configuration

Validate all env vars at startup with Zod — fail fast if anything is missing.

```ts
// config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  FRONTEND_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  process.exit(1); // crash immediately — do not start with bad config
}

export const env = parsed.data;
```

---

## Tech Stack

| Concern     | Package                                | Why                                    |
| ----------- | -------------------------------------- | -------------------------------------- |
| Framework   | `express`                              | Minimal, battle-tested, huge ecosystem |
| Language    | `typescript`                           | Type safety, better refactoring        |
| Database    | `mongoose`                             | MongoDB ODM with schema validation     |
| Validation  | `zod`                                  | Runtime + compile-time safe schemas    |
| Auth        | `jsonwebtoken` + `bcryptjs`            | Industry standard                      |
| Logging     | `winston`                              | Structured logs, transport-flexible    |
| Security    | `helmet`, `cors`, `express-rate-limit` | OWASP Top 10 baseline                  |
| Env config  | `dotenv` + `zod`                       | Validated config at startup            |
| Dev tooling | `tsx`, `nodemon`                       | Fast TypeScript dev loop               |

---

## Security Baseline (OWASP)

Applied globally in `app.ts`:

```ts
app.use(helmet()); // sets secure HTTP headers
app.use(
  cors({
    origin: env.FRONTEND_URL, // restrict origins
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" })); // prevent large payload attacks
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // brute force protection
```

- Passwords hashed with `bcrypt` (cost factor 12)
- Refresh tokens stored hashed in DB (same principle as password hashing)
- `select: false` on `passwordHash` in schema — never accidentally returned
- Input sanitization via Zod (strips unknown fields)
- HTTPS enforced in production via reverse proxy (Nginx / cloud platform)

---

## Folder Naming Rules

| What                  | Convention                        | Example              |
| --------------------- | --------------------------------- | -------------------- |
| Files                 | `kebab-case`                      | `auth.service.ts`    |
| Classes               | `PascalCase`                      | `AppError`           |
| Functions / variables | `camelCase`                       | `asyncHandler`       |
| Mongoose models       | `PascalCase`                      | `UserModel`          |
| Env vars              | `SCREAMING_SNAKE_CASE`            | `JWT_ACCESS_SECRET`  |
| MongoDB collections   | Mongoose pluralizes automatically | `users`, `equipment` |

---

## What This Architecture Does NOT Include (and why)

| Pattern                              | Verdict                                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CQRS / command bus                   | Adds indirection with no payoff at this scale. Use it if the team grows and handlers explode (50+).                                                                       |
| Full Clean Architecture (4 layers)   | Domain layer makes sense in .NET where value objects + rich domain models are idiomatic. Mongoose schemas + services cover the same ground in Node.js with less ceremony. |
| DI container (InversifyJS, tsyringe) | Adds complexity. Node.js module singletons are testable with jest mocking. Revisit if the project grows significantly.                                                    |
| Repository interface abstractions    | Useful in .NET for swapping EF and for unit testing. In Node.js, `jest.mock()` on the module is simpler and just as effective.                                            |

---

## When to Evolve This Architecture

Do NOT add complexity preemptively. Introduce more advanced patterns only when you hit a real wall:

| Signal                                                        | What to add                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| Team grows to 5+ devs and PRs conflict in services frequently | Consider a shared domain layer with domain objects         |
| Services start importing each other (circular deps)           | Introduce an event emitter / message bus                   |
| 50+ use cases and testing becomes slow                        | Consider CQRS (commands/queries split, no full bus needed) |
| Multiple data sources or swap from MongoDB                    | Add repository interfaces                                  |

The architecture is **simple by default, structured by discipline**. Complexity earns its way in — it is never added in advance.
