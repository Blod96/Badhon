# Badhon (বাঁধন) — NWU Blood Connect

> **University and Community Blood Donation Platform for North Western University (NWU), Bangladesh.**

Badhon is a secure, privacy-first, consent-driven blood donation coordination platform connecting voluntary donors with emergency blood requests in the Khulna metropolitan area and NWU campus community.

---

## Documentation Index (Phase 1 Deliverables)

All architectural and system design documentation is available under [`docs/`](./docs/):

1. **[Product Requirements Document (PRD)](./docs/PRD.md):** Executive mission, non-medical disclaimer, user roles, feature specifications, and unresolved policy defaults.
2. **[System Architecture](./docs/ARCHITECTURE.md):** Monorepo structure, trust boundaries, dual-document pattern, background processing, and technology version matrix.
3. **[Database Schema](./docs/DATABASE_SCHEMA.md):** Complete field-level specification for all 14 Cloud Firestore collections, composite indexes, and data retention rules.
4. **[Security Model & Threat Assessment](./docs/SECURITY_MODEL.md):** 12-vector threat analysis, default-deny Firestore Security Rules blueprint, and custom claims RBAC.
5. **[API Contracts](./docs/API_CONTRACTS.md):** TypeScript request/response contracts and Zod schemas for all Callable and Scheduled Cloud Functions.
6. **[UI Screen Map & Design Tokens](./docs/UI_SCREEN_MAP.md):** Design token specifications, 25 mobile screens (Flutter), 10 public web pages (Next.js), and 10 admin portal pages (Next.js).
7. **[Testing Strategy](./docs/TEST_STRATEGY.md):** Unit, rules emulation, integration, UI widget, and end-to-end testing with synthetic data.
8. **[Deployment & Environment Operations](./docs/DEPLOYMENT.md):** Local emulator, staging, production topology, secret management, and superadmin bootstrap protocol.
9. **[Architecture Decision Records (ADRs)](./docs/DECISIONS.md):** ADR-001 through ADR-010 documenting key technical and architectural decisions.
10. **[Implementation Roadmap](./docs/PHASES.md):** 10-phase implementation plan, definition of done, and phase gate acceptance criteria.

---

## Monorepo Layout

```
Badhon/
├── apps/
│   ├── mobile/         # Flutter Android App (General Users, Donors & Requesters)
│   ├── web/            # Next.js 15 Public Community Portal
│   └── admin/          # Next.js 15 Protected Admin Dashboard
├── functions/          # TypeScript Cloud Functions v2
├── packages/
│   ├── domain/         # Shared domain types, enums & validators
│   └── api-contracts/  # Zod API request/response schemas
├── firebase/           # Firestore security rules, indexes & test suites
└── docs/               # System documentation & specifications
```

---

## Quickstart & Verification Commands

### 1. Install & Build
```bash
# Install all dependencies across monorepo
pnpm install

# Build shared packages and Cloud Functions
pnpm build
```

### 2. Run Test Suites
```bash
# Run all integration, security & E2E smoke tests
pnpm test:all

# Or run individual suites:
pnpm test:rules        # Firestore emulator security rules (12/12 scenarios)
pnpm test:lifecycle    # Blood request lifecycle, quotas & rate limits
pnpm test:matching     # Donor matching, RBC compatibility & FCM privacy
pnpm test:contacts     # Consent-based contact sharing security (8 attacks blocked)
pnpm test:moderation   # Admin moderation & privilege escalation gates
pnpm test:offline      # Offline resilience & zero-PII cache verification
pnpm test:e2e          # Complete 8-stage lifecycle smoke simulation
```

### 3. Frontends
- **Public Web:** `pnpm --filter "@badhon/web" dev` (Runs on `http://localhost:3000`)
- **Admin Portal:** `pnpm --filter "@badhon/admin" dev` (Runs on `http://localhost:3001`)
- **Mobile (Flutter):** `cd apps/mobile && flutter run`

---

## Platform Disclaimer
*Badhon is strictly a communication and coordination platform. It is not a medical diagnostic authority, blood bank, or blood compatibility determinant. Transfusion safety and donor eligibility verification remain the sole responsibility of licensed medical personnel.*
