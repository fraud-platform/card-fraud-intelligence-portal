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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         Browser Layer                           â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚  â”‚   React UI  â”‚â”€â”€â”€â–¶â”‚ React Routerâ”‚â”€â”€â”€â–¶â”‚  Ant Design â”‚        â”‚
â”‚  â”‚   (Vite)    â”‚    â”‚    v7       â”‚    â”‚     v5      â”‚        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚         â”‚                                     â”‚                 â”‚
â”‚         â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                 â”‚
â”‚         â””â”€â”€â”€â–¶â”‚  Refine.dev â”‚â”€â”€â”€â–¶â”‚ React Query â”‚                 â”‚
â”‚              â”‚   (Core)    â”‚    â”‚  (State)   â”‚                 â”‚
â”‚              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         Service Layer                           â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚  â”‚ Auth0 SPA   â”‚    â”‚   Axios     â”‚    â”‚   Sentry    â”‚        â”‚
â”‚  â”‚  (Auth)     â”‚    â”‚  (HTTP)     â”‚    â”‚ (Errors)    â”‚        â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        Backend Services                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚   Rule Management API    â”‚    â”‚ Transaction Management   â”‚  â”‚
â”‚  â”‚   (FastAPI / Quarkus)    â”‚    â”‚      (FastAPI)           â”‚  â”‚
â”‚  â”‚   /api/v1/rules/*        â”‚    â”‚      /api/v1/*           â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Technology Decisions

| Layer               | Technology          | Rationale                                       |
| ------------------- | ------------------- | ----------------------------------------------- |
| **Build**           | Vite 7              | Fast HMR, optimized production builds           |
| **Routing**         | React Router 7      | Latest features, better type safety             |
| **Admin Framework** | Refine.dev          | Rapid CRUD development, built-in data providers |
| **UI Library**      | Ant Design 5        | Enterprise components, accessible, themeable    |
| **State**           | React Query         | Server state, caching, background updates       |
| **Testing**         | Vitest + Playwright | Fast unit tests, reliable E2E                   |
| **Auth**            | Auth0 SPA           | Enterprise SSO, OAuth 2.0/OIDC compliant        |

---

## Project Structure

### Directory Overview

```
card-fraud-intelligence-portal/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/                      # Backend API integration
â”‚   â”‚   â”œâ”€â”€ endpoints.ts          # API route definitions
â”‚   â”‚   â”œâ”€â”€ httpClient.ts         # Axios wrapper with auth
â”‚   â”‚   â”œâ”€â”€ types.ts              # API request/response types
â”‚   â”‚   â””â”€â”€ fieldDefinitions.ts   # Field registry API client
â”‚   â”‚
â”‚   â”œâ”€â”€ app/                      # Application core
â”‚   â”‚   â”œâ”€â”€ accessControlProvider.ts  # RBAC enforcement
â”‚   â”‚   â”œâ”€â”€ authProvider.ts           # Auth integration
â”‚   â”‚   â”œâ”€â”€ auth0Client.ts            # Auth0 SPA wrapper
â”‚   â”‚   â”œâ”€â”€ dataProvider.ts           # Refine data provider
â”‚   â”‚   â””â”€â”€ routes.tsx                # Resource registration
â”‚   â”‚
â”‚   â”œâ”€â”€ components/               # Shared UI components
â”‚   â”‚   â”œâ”€â”€ review/               # Transaction review components
â”‚   â”‚   â”œâ”€â”€ notes/                # Analyst notes components
â”‚   â”‚   â””â”€â”€ fieldRegistry/        # Field registry components
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/                    # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ useReview.ts          # Transaction review actions
â”‚   â”‚   â”œâ”€â”€ useNotes.ts           # Notes CRUD operations
â”‚   â”‚   â”œâ”€â”€ useWorklist.ts        # Worklist & claim next
â”‚   â”‚   â””â”€â”€ useCases.ts           # Case management
â”‚   â”‚
â”‚   â”œâ”€â”€ mocks/                    # MSW mock handlers
â”‚   â”‚   â”œâ”€â”€ handlers.ts           # API mock definitions
â”‚   â”‚   â””â”€â”€ data/                 # Mock data files
â”‚   â”‚
â”‚   â”œâ”€â”€ pages/                    # Standalone pages
â”‚   â”‚   â”œâ”€â”€ Login.tsx             # Login page (dev mode)
â”‚   â”‚   â””â”€â”€ Callback.tsx          # Auth0 OAuth callback
â”‚   â”‚
â”‚   â”œâ”€â”€ resources/                # CRUD resources
â”‚   â”‚   â”œâ”€â”€ ruleFields/           # Rule Field Metadata
â”‚   â”‚   â”œâ”€â”€ rules/                # Fraud Rules
â”‚   â”‚   â”œâ”€â”€ ruleSets/             # Rule Set Bundles
â”‚   â”‚   â”œâ”€â”€ approvals/            # Governance Workflow
â”‚   â”‚   â”œâ”€â”€ auditLogs/            # Compliance Trail
â”‚   â”‚   â”œâ”€â”€ transactions/         # Transaction Management
â”‚   â”‚   â”œâ”€â”€ worklist/             # Analyst Worklist
â”‚   â”‚   â””â”€â”€ cases/                # Case Management
â”‚   â”‚
â”‚   â”œâ”€â”€ shared/                   # Shared utilities
â”‚   â”‚   â”œâ”€â”€ components/           # Shared UI components
â”‚   â”‚   â”œâ”€â”€ hooks/                # Shared hooks
â”‚   â”‚   â”œâ”€â”€ utils/                # Utility functions
â”‚   â”‚   â””â”€â”€ constants/            # Constants
â”‚   â”‚
â”‚   â”œâ”€â”€ theme/                    # Theming
â”‚   â”‚   â””â”€â”€ tokens.ts             # Color registries
â”‚   â”‚
â”‚   â””â”€â”€ types/                    # TypeScript types
â”‚       â”œâ”€â”€ domain.ts             # Core business entities
â”‚       â”œâ”€â”€ enums.ts              # Enumerations
â”‚       â”œâ”€â”€ transaction.ts        # Transaction types
â”‚       â”œâ”€â”€ review.ts             # Review workflow types
â”‚       â”œâ”€â”€ notes.ts              # Notes types
â”‚       â”œâ”€â”€ case.ts               # Case types
â”‚       â””â”€â”€ worklist.ts           # Worklist types
â”‚
â”œâ”€â”€ e2e/                          # Playwright E2E tests
â”œâ”€â”€ docs/                         # Documentation
â”œâ”€â”€ public/                       # Static assets
â””â”€â”€ [config files]                # Build/tool configs
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
  rule_id â†’ id
  ruleset_id â†’ id
  approval_id â†’ id
  field_key â†’ id
  transaction_id â†’ id
  case_id â†’ id
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     Maker Workflow                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  1. Create/Edit Entity â†’ 2. Save as DRAFT â†’ 3. Submit     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Checker Workflow                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  4. View Pending â†’ 5. Review Changes â†’ 6. Approve/Reject  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Rule Versioning Flow

```
Existing Rule (APPROVED)
         â”‚
         â”‚ Edit Request
         â–¼
Create New Version (DRAFT)
         â”‚
         â”‚ Submit
         â–¼
New Version (PENDING_APPROVAL)
         â”‚
         â”‚ Approve
         â–¼
New Version (APPROVED)
         â”‚
         â”‚ (Old version remains immutable)
```

### Analyst Workflow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Worklist   â”‚      â”‚   Review    â”‚      â”‚   Case      â”‚
â”‚   (Claim)   â”‚ â”€â”€â”€â–º â”‚ (Analyze)   â”‚ â”€â”€â”€â–º â”‚ (Resolve)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                    â”‚                    â”‚
       â””â”€â”€â”€â”€ Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€ Matched Rules â”€â”€â”€â”€â”€â”˜
```

---

## Component Architecture

### Component Hierarchy

```
App
â”œâ”€â”€ AuthProvider (Auth0/Dev mode)
â”œâ”€â”€ RefineProvider
â”‚   â”œâ”€â”€ DataProvider
â”‚   â”œâ”€â”€ AccessControlProvider
â”‚   â””â”€â”€ NotificationProvider
â”œâ”€â”€ Refine
â”‚   â”œâ”€â”€ Sidebar (Navigation)
â”‚   â”œâ”€â”€ Header (User info, logout)
â”‚   â””â”€â”€ Resource Routes
â”‚       â”œâ”€â”€ List
â”‚       â”œâ”€â”€ Create
â”‚       â”œâ”€â”€ Edit
â”‚       â””â”€â”€ Show
â”œâ”€â”€ ErrorBoundary
â””â”€â”€ Sentry.ErrorBoundary
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

| Target            | Lines | Status       |
| ----------------- | ----- | ------------ |
| List components   | < 150 | âœ… Achieved |
| Form components   | < 200 | âœ… Achieved |
| Show components   | < 200 | âœ… Achieved |
| Shared components | < 100 | âœ… Achieved |

Large components have been broken down into smaller, focused sub-components.

---

## State Management

### Client State

| State           | Solution            | Scope           |
| --------------- | ------------------- | --------------- |
| **UI State**    | useState/useReducer | Component level |
| **Form State**  | Ant Design Form     | Form level      |
| **Modal State** | useModalAction hook | Shared          |
| **Route State** | React Router        | Global          |

### Server State

| State            | Solution                 | Configuration                   |
| ---------------- | ------------------------ | ------------------------------- |
| **API Data**     | React Query (via Refine) | Cached, refetch on window focus |
| **Mutations**    | useMutation hook         | Optimistic updates              |
| **Invalidation** | useInvalidate hook       | Manual refetch triggers         |

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
User â†’ Auth0 Login â†’ ID Token + Access Token â†’ React SPA
                                              â”‚
                                              â–¼
                                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                    â”‚  Token Storage  â”‚
                                    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
                                    â”‚ Dev: sessionStorageâ”‚
                                    â”‚ Prod: Memory    â”‚
                                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Authorization Layers

| Layer          | Implementation          | Purpose               |
| -------------- | ----------------------- | --------------------- |
| **UI**         | `accessControlProvider` | Hide/disable actions  |
| **Router**     | Protected routes        | Redirect unauthorized |
| **API Client** | Auth headers            | Send tokens           |
| **Backend**    | Role/permission checks  | Actual enforcement    |

### Security Features

- **PII Masking**: Fields with `is_sensitive: true` render as `â€¢â€¢â€¢â€¢`
- **No PAN**: Card numbers never handled in UI
- **Input Validation**: Form validation at component level
- **XSS Prevention**: Proper escaping, no `dangerouslySetInnerHTML`
- **Error Boundaries**: Graceful failure handling
- **Security Headers**: CSP, HSTS, X-Frame-Options (production)

---

## Design Decisions

### Why Refine.dev?

| Decision                   | Rationale                                       |
| -------------------------- | ----------------------------------------------- |
| **Chose Refine**           | Rapid CRUD development, built-in data providers |
| **Ant Design integration** | Enterprise components, consistent patterns      |
| **React Query included**   | Efficient server state management               |
| **TypeScript first**       | Type-safe development                           |

### Why React Router v7?

| Decision                  | Rationale                           |
| ------------------------- | ----------------------------------- |
| **Upgraded from v6**      | Latest features, better type safety |
| **New route syntax**      | Simpler route definitions           |
| **Built-in data loading** | Better loading states               |

### Why Ant Design?

| Decision                  | Rationale                            |
| ------------------------- | ------------------------------------ |
| **Enterprise components** | Tables, forms, modals out of box     |
| **Accessibility**         | WCAG compliant components            |
| **Theming**               | Easy customization via Design Tokens |
| **Documentation**         | Comprehensive examples               |

### Why MSW for Mocking?

| Decision                | Rationale                       |
| ----------------------- | ------------------------------- |
| **API-first mocking**   | Mock at network level           |
| **Dev and test parity** | Same mocks in both environments |
| **Type-safe requests**  | TypeScript integration          |

---

## Next Steps

- **Code Map**: See [Code Map](../codemap.md)
- **Patterns**: See [Code Patterns](./patterns.md)
- **Resources**: See [Development README](./README.md)
- **API**: See [API README](../03-api/README.md)
