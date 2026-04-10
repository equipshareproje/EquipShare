import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { env } from "../env";
import { registry } from "./registry";

// Side-effect imports — each file calls registry.registerPath() on load
import "./auth.docs";
import "./listing.docs";
import "./booking.docs";
import "./review.docs";
import "./dispute.docs";
import "./report.docs";
import "./earnings.docs";
import "./circle.docs";

// ── Generate spec ──────────────────────────────────────────────────────────

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "EquipShare API",
      version: "1.0.0",
      description: `
## EquipShare — Equipment Rental Marketplace API

**Base URL:** \`${env.BASE_URL}\`
**Docs:** \`${env.BASE_URL}/api/docs\`

---

### Authentication
Most endpoints require a **Bearer token** in the \`Authorization\` header.
Obtain it from \`POST /api/auth/login\`. Tokens expire in 15 min — use \`POST /api/auth/refresh\` with the HttpOnly cookie to renew.

### Tags
| Tag | Description |
|-----|-------------|
| **Auth** | Register, login, logout, email verification, token refresh |
| **Listings** | Create, browse, edit, delete equipment listings |
| **Bookings** | Full rental lifecycle — request, approve/reject, handover |
| **Reviews** | Submit and fetch reviews |
| **Disputes** | File and resolve booking disputes |
| **Reports** | Report and moderate listings |

### Booking Lifecycle (quick ref)
\`Pending\` → \`Approved\` → \`Active\` → \`Completed\`
      `,
    },
    servers: [{ url: env.BASE_URL }],
  });
};
