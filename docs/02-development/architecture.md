# Architecture Overview

System architecture, design patterns, and technical decisions for the Card Fraud Intelligence Portal.

**Last Updated**: 2026-01-27

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Project Structure](#project-structure)
3. [Central Integration Points](#central-integration-points)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [Security Architecture](#security-architecture)
8. [Design Decisions](#design-decisions)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Layer                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   React UI  │───▶│ React Router│───▶│  Ant Design │        │
│  │   (Vite)    │    │    v7       │    │     v5      │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                                     │                 │
│         │    ┌─────────────┐    ┌─────────────┐                 │
│         └───▶│  Refine.dev │───▶│ React Query │                 │
│              │   (Core)    │    │  (State)   │                 │
│              └─────────────┘    └─────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Service Layer                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ Auth0 SPA   │    │   Axios     │    │   Sentry    │        │
│  │  (Auth)     │    │  (HTTP)     │    │ (Errors)    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Services                         │
│  ┌──────────────────────────┐    ┌──────────────────────────┐  │
│  │   Rule Management API    │    │ Transaction Management   │  │
│  │   (FastAPI / Quarkus)    │    │      (FastAPI)           │  │
│  │   /api/v1/rules/*        │    │      /api/v1/*           │  │
│  └──────────────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Decisions

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Build** | Vite 7 | Fast HMR, optimized production builds |
| **Routing** | React Router 7 | Latest features, better type safety |
| **Admin Framework** | Refine.dev | Rapid CRUD development, built-in data providers |
| **UI Library** | Ant Design 5 | Enterprise components, accessible, themeable |
| **State** | React Query | Server state, caching, background updates |
| **Testing** | Vitest + Playwright | Fast unit tests, reliable E2E |
| **Auth** | Auth0 SPA | Enterprise SSO, OAuth 2.0/OIDC compliant |

---

## Project Structure

### Directory Overview

```
card-fraud-intelligence-portal/
├── src/
│   ├── api/                      # Backend API integration
│   │   ├── endpoints.ts          # API route definitions
│   │   ├── httpClient.ts         # Axios wrapper with auth
│   │   ├── types.ts              # API request/response types
│   │   └── fieldDefinitions.ts   # Field registry API client
│   │
│   ├── app/                      # Application core
│   │   ├── accessControlProvider.ts  # RBAC enforcement
│   │   ├── authProvider.ts           # Auth integration
│   │   ├── auth0Client.ts            # Auth0 SPA wrapper
│   │   ├── dataProvider.ts           # Refine data provider
│   │   └── routes.tsx                # Resource registration
│   │
│   ├── components/               # Shared UI components
│   │   ├── review/               # Transaction review components
│   │   ├── notes/                # Analyst notes components
│   │   └── fieldRegistry/        # Field registry components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useReview.ts          # Transaction review actions
│   │   ├── useNotes.ts           # Notes CRUD operations
│   │   ├── useWorklist.ts        # Worklist & claim next
│   │   └── useCases.ts           # Case management
│   │
│   ├── mocks/                    # MSW mock handlers
│   │   ├── handlers.ts           # API mock definitions
│   │   └── data/                 # Mock data files
│   │
│   ├── pages/                    # Standalone pages
│   │   ├── Login.tsx             # Login page (dev mode)
│   │   └── Callback.tsx          # Auth0 OAuth callback
│   │
│   ├── resources/                # CRUD resources
│   │   ├── ruleFields/           # Rule Field Metadata
│   │   ├── rules/                # Fraud Rules
│   │   ├── ruleSets/             # Rule Set Bundles
│   │   ├── approvals/            # Governance Workflow
│   │   ├── auditLogs/            # Compliance Trail
│   │   ├── transactions/         # Transaction Management
│   │   ├── worklist/             # Analyst Worklist
│   │   └── cases/                # Case Management
│   │
│   ├── shared/                   # Shared utilities
│   │   ├── components/           # Shared UI components
│   │   ├── hooks/                # Shared hooks
│   │   ├── utils/                # Utility functions
│   │   └── constants/            # Constants
│   │
│   ├── theme/                    # Theming
│   │   └── tokens.ts             # Color registries
│   │
│   └── types/                    # TypeScript types
│       ├── domain.ts             # Core business entities
│       ├── enums.ts              # Enumerations
│       ├── transaction.ts        # Transaction types
│       ├── review.ts             # Review workflow types
│       ├── notes.ts              # Notes types
│       ├── case.ts               # Case types
│       └── worklist.ts           # Worklist types
│
├── e2e/                          # Playwright E2E tests
├── docs/                         # Documentation
├── public/                       # Static assets
└── [config files]                # Build/tool configs
```

---

## Central Integration Points

### 1. API Endpoints (`src/api/endpoints.ts`)

All REST API routes are centralized here:

```typescript
export const ENDPOINTS = {
  // Rule Management
  RULE_FIELDS: { LIST, CREATE, GET, UPDATE },
  RULES: { LIST, CREATE, GET },
  RULE_VERSIONS: { LIST, GET, CREATE, SUBMIT, APPROVE, REJECT },
  RULESETS: { LIST, CREATE, GET, UPDATE },
  RULESET_VERSIONS: { LIST, GET, SUBMIT, APPROVE, REJECT, ACTIVATE, COMPILE },
  APPROVALS: { LIST, GET, DECIDE },
  AUDIT_LOGS: { LIST, GET },

  // Transaction Management
  TRANSACTIONS: { LIST, GET, METRICS, OVERVIEW },
  REVIEW: { GET, STATUS, ASSIGN, RESOLVE, ESCALATE },
  NOTES: { LIST, CREATE, UPDATE, DELETE },
  WORKLIST: { LIST, STATS, CLAIM },
  CASES: { LIST, GET, CREATE, UPDATE, RESOLVE, TRANSACTIONS, ACTIVITY },
  BULK: { ASSIGN, STATUS_UPDATE, ESCALATE },

  // Field Registry
  FIELD_REGISTRY: { GET, VERSIONS, NEXT_ID, PUBLISH },
};
```

### 2. Resource Registration (`src/app/routes.tsx`)

Navigation groups and resource registration:

```typescript
// Rule Management Group
- ruleFields (Fields)
- rules (Rules)
- ruleSets (RuleSets)
- approvals (Approvals)
- auditLogs (Audit Logs)

// Transaction Management Group
- transactions (Transactions)
- transaction-metrics (Metrics)
- worklist (Worklist)
- cases (Cases)
```

### 3. Data Provider (`src/app/dataProvider.ts`)

Handles ID normalization and query building:

```typescript
// ID field mapping
{
  rule_id → id
  ruleset_id → id
  approval_id → id
  field_key → id
  transaction_id → id
  case_id → id
}
```

### 4. Access Control (`src/app/accessControlProvider.ts`)

RBAC enforcement for maker-checker workflow:

```typescript
// Makers: create, edit, delete, submit
// Checkers: approve, reject
// Analysts: review, assign, resolve, escalate
// Supervisors: override, final decision
```

---

## Data Flow Patterns

### Maker-Checker Flow

```
┌───────────────────────────────────────────────────────────┐
│                     Maker Workflow                         │
├───────────────────────────────────────────────────────────┤
│  1. Create/Edit Entity → 2. Save as DRAFT → 3. Submit     │
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                    Checker Workflow                        │
├───────────────────────────────────────────────────────────┤
│  4. View Pending → 5. Review Changes → 6. Approve/Reject  │
└───────────────────────────────────────────────────────────┘
```

### Rule Versioning Flow

```
Existing Rule (APPROVED)
         │
         │ Edit Request
         ▼
Create New Version (DRAFT)
         │
         │ Submit
         ▼
New Version (PENDING_APPROVAL)
         │
         │ Approve
         ▼
New Version (APPROVED)
         │
         │ (Old version remains immutable)
```

### Analyst Workflow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Worklist   │      │   Review    │      │   Case      │
│   (Claim)   │ ───► │ (Analyze)   │ ───► │ (Resolve)   │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       └──── Notes ─────────┴──── Matched Rules ─────┘
```

---

## Component Architecture

### Component Hierarchy

```
App
├── AuthProvider (Auth0/Dev mode)
├── RefineProvider
│   ├── DataProvider
│   ├── AccessControlProvider
│   └── NotificationProvider
├── Refine
│   ├── Sidebar (Navigation)
│   ├── Header (User info, logout)
│   └── Resource Routes
│       ├── List
│       ├── Create
│       ├── Edit
│       └── Show
├── ErrorBoundary
└── Sentry.ErrorBoundary
```

### Component Patterns

**1. List Components** (`list.tsx`):
- Use `useTable` hook for data fetching
- Implement filters via `syncWithLocation`
- Memoize column definitions
- Handle row actions consistently

**2. Form Components** (`create.tsx`, `edit.tsx`):
- Use `useForm` hook from Refine
- Implement validation rules
- Handle success/error notifications
- Use `useCan` for authorization checks

**3. Show Components** (`show.tsx`):
- Use `useOne` hook for data fetching
- Display read-only information
- Support tabbed content for related data
- Add action buttons based on permissions

**4. Shared Components**:
- Extract reusable logic to `src/shared/components/`
- Use composition over inheritance
- Implement proper TypeScript types
- Add unit tests for complex components

### Component Size Guidelines

| Target | Lines | Status |
|--------|-------|--------|
| List components | < 150 | ✅ Achieved |
| Form components | < 200 | ✅ Achieved |
| Show components | < 200 | ✅ Achieved |
| Shared components | < 100 | ✅ Achieved |

Large components have been broken down into smaller, focused sub-components.

---

## State Management

### Client State

| State | Solution | Scope |
|-------|----------|-------|
| **UI State** | useState/useReducer | Component level |
| **Form State** | Ant Design Form | Form level |
| **Modal State** | useModalAction hook | Shared |
| **Route State** | React Router | Global |

### Server State

| State | Solution | Configuration |
|-------|----------|--------------|
| **API Data** | React Query (via Refine) | Cached, refetch on window focus |
| **Mutations** | useMutation hook | Optimistic updates |
| **Invalidation** | useInvalidate hook | Manual refetch triggers |

### State Management Patterns

**1. Data Fetching**:
```typescript
const { data, isLoading, error } = useOne({
  resource: "rules",
  id: ruleId,
});
```

**2. Mutations**:
```typescript
const { mutate } = useUpdate();
mutate(
  { resource: "rules", id: ruleId, values: newValues },
  { onSuccess: () => invalidate({ resource: "rules" }) }
);
```

**3. Custom Hooks**:
```typescript
// Encapsulate related state and operations
export const useReview = (transactionId: string) => {
  const { data } = useOne({ resource: "reviews", id: transactionId });
  const { mutate } = useUpdate();
  // ... return interface
};
```

---

## Security Architecture

### Authentication Flow

```
User → Auth0 Login → ID Token + Access Token → React SPA
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  Token Storage  │
                                    ├─────────────────┤
                                    │ Dev: sessionStorage│
                                    │ Prod: Memory    │
                                    └─────────────────┘
```

### Authorization Layers

| Layer | Implementation | Purpose |
|-------|----------------|---------|
| **UI** | `accessControlProvider` | Hide/disable actions |
| **Router** | Protected routes | Redirect unauthorized |
| **API Client** | Auth headers | Send tokens |
| **Backend** | Role/permission checks | Actual enforcement |

### Security Features

- **PII Masking**: Fields with `is_sensitive: true` render as `••••`
- **No PAN**: Card numbers never handled in UI
- **Input Validation**: Form validation at component level
- **XSS Prevention**: Proper escaping, no `dangerouslySetInnerHTML`
- **Error Boundaries**: Graceful failure handling
- **Security Headers**: CSP, HSTS, X-Frame-Options (production)

---

## Design Decisions

### Why Refine.dev?

| Decision | Rationale |
|----------|-----------|
| **Chose Refine** | Rapid CRUD development, built-in data providers |
| **Ant Design integration** | Enterprise components, consistent patterns |
| **React Query included** | Efficient server state management |
| **TypeScript first** | Type-safe development |

### Why React Router v7?

| Decision | Rationale |
|----------|-----------|
| **Upgraded from v6** | Latest features, better type safety |
| **New route syntax** | Simpler route definitions |
| **Built-in data loading** | Better loading states |

### Why Ant Design?

| Decision | Rationale |
|----------|-----------|
| **Enterprise components** | Tables, forms, modals out of box |
| **Accessibility** | WCAG compliant components |
| **Theming** | Easy customization via Design Tokens |
| **Documentation** | Comprehensive examples |

### Why MSW for Mocking?

| Decision | Rationale |
|----------|-----------|
| **API-first mocking** | Mock at network level |
| **Dev and test parity** | Same mocks in both environments |
| **Type-safe requests** | TypeScript integration |

---

## Architecture Grade: A- → Target A+

| Area | Grade | Notes |
|------|-------|-------|
| Refine.dev Integration | A | Excellent patterns |
| TypeScript Strict Mode | A | No `any`, comprehensive types |
| Custom Hooks Pattern | A | Good separation |
| Test Coverage | A | 80%+ all metrics |
| Access Control/RBAC | A | Clean maker-checker |
| **Component Size** | **A** | **Done** - broken down |
| **Code Duplication** | **A** | **Done** - utilities extracted |
| **Error Handling** | **A** | **Done** - handleAsyncError utility |
| **Memoization** | **A-** | **In progress** - needs AbortController |

**Remaining for A+**:
- Complete memoization (add AbortController to hooks)
- Fix 10 remaining ESLint warnings
- Add nonce-based CSP (requires Vite plugin)

---

## Next Steps

- **Code Map**: See [Code Map](./codemap.md)
- **Patterns**: See [Code Patterns](./patterns.md)
- **Resources**: See [Resources](./resource-overview.md)
- **API**: See [API Overview](../03-api/overview.md)
