# Mock Service Worker (MSW) API Layer

This directory contains the Mock Service Worker setup for development and testing.

## Overview

MSW intercepts network requests at the service worker level, providing realistic API mocking without modifying application code.

## Features

- **Complete API Coverage**: Mocks all endpoints from `src/api/endpoints.ts`
- **Realistic Data**: 10-20 sample records for each entity type
- **In-Memory Storage**: Full CRUD operations with persistent state during session
- **Pagination Support**: Standard page/limit query parameters
- **Filtering**: Query parameter filtering for all list endpoints
- **Authentication**: Mock auth that accepts any credentials
- **Request Delays**: Artificial 300ms delay for realistic network simulation

## Structure

```
src/mocks/
├── data/              # Mock data generators and stores
│   ├── ruleFields.ts  # RuleField mock data & store
│   ├── rules.ts       # Rule & RuleVersion mock data & store
│   ├── ruleSets.ts    # RuleSet mock data & store
│   ├── approvals.ts   # Approval mock data & store
│   └── auditLogs.ts   # AuditLog mock data & store
├── handlers.ts        # MSW request handlers
├── browser.ts         # MSW browser setup
├── index.ts           # Main exports
└── README.md          # This file
```

## Usage

### Development Mode

MSW is automatically enabled in development mode (`pnpm dev`). No additional configuration needed.

The application will log `[MSW] Mock Service Worker started` in the console when active.

### Testing

Import and use in tests:

```typescript
import { worker, handlers } from "./mocks";

// In test setup
beforeAll(() => worker.start());
afterEach(() => worker.resetHandlers());
afterAll(() => worker.stop());
```

### Custom Test Handlers

Override handlers for specific tests:

```typescript
import { worker } from "./mocks";
import { http, HttpResponse } from "msw";

test("handles error response", async () => {
  worker.use(
    http.get("/api/v1/rules/:ruleId", () => {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    })
  );

  // Test error handling...
});
```

## Mock Data Stores

Each entity has an in-memory store that provides:

- **Persistence**: Data persists across requests during the session
- **CRUD Operations**: Full create, read, update, delete support
- **Filtering**: Query-based filtering capabilities
- **Relationships**: Maintains associations (e.g., RuleSets with Rules)

### Example: RuleFieldStore

```typescript
import { RuleFieldStore } from "./mocks/data/ruleFields";

const store = new RuleFieldStore();

// Get all fields
const fields = store.getAll();

// Get by key
const field = store.getByKey("CARD_NUMBER");

// Create new field
const newField = store.create({
  field_key: "NEW_FIELD",
  display_name: "New Field",
  data_type: DataType.STRING,
  allowed_operators: [Operator.EQ],
  multi_value_allowed: false,
  is_sensitive: false,
  is_active: true,
});

// Update field
store.update("NEW_FIELD", { display_name: "Updated Name" });

// Delete field
store.delete("NEW_FIELD");
```

## API Endpoints

All endpoints from `src/api/endpoints.ts` are mocked:

### Authentication

- `POST /api/v1/auth/login` - Login (accepts any credentials)
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

### Rule Fields

- `GET /api/v1/rule-fields` - List fields (with pagination/filters)
- `POST /api/v1/rule-fields` - Create field
- `GET /api/v1/rule-fields/:fieldKey` - Get field
- `PUT /api/v1/rule-fields/:fieldKey` - Update field
- `DELETE /api/v1/rule-fields/:fieldKey` - Delete field
- `GET /api/v1/rule-fields/:fieldKey/metadata` - Get metadata
- `POST /api/v1/rule-fields/:fieldKey/metadata` - Set metadata
- `DELETE /api/v1/rule-fields/:fieldKey/metadata/:metaKey` - Delete metadata

### Rules

- `GET /api/v1/rules` - List rules (with pagination/filters)
- `POST /api/v1/rules` - Create rule
- `GET /api/v1/rules/:ruleId` - Get rule with version
- `PUT /api/v1/rules/:ruleId` - Update rule
- `DELETE /api/v1/rules/:ruleId` - Delete rule
- `POST /api/v1/rules/:ruleId/submit` - Submit for approval
- `GET /api/v1/rules/:ruleId/versions` - List versions
- `POST /api/v1/rules/:ruleId/versions` - Create version
- `GET /api/v1/rules/:ruleId/versions/:versionId` - Get version

### RuleSets

- `GET /api/v1/rulesets` - List rulesets (with pagination/filters)
- `POST /api/v1/rulesets` - Create ruleset
- `GET /api/v1/rulesets/:rulesetId` - Get ruleset with rules
- `PUT /api/v1/rulesets/:rulesetId` - Update ruleset
- `DELETE /api/v1/rulesets/:rulesetId` - Delete ruleset
- `POST /api/v1/rulesets/:rulesetId/submit` - Submit for approval
- `POST /api/v1/rulesets/:rulesetId/compile` - Compile ruleset
- `GET /api/v1/rulesets/:rulesetId/rules` - List rules in set
- `POST /api/v1/rulesets/:rulesetId/rules` - Add rule to set
- `DELETE /api/v1/rulesets/:rulesetId/rules/:ruleVersionId` - Remove rule

### Approvals

- `GET /api/v1/approvals` - List approvals (with filters)
- `POST /api/v1/approvals` - Create approval
- `GET /api/v1/approvals/:approvalId` - Get approval
- `POST /api/v1/approvals/:approvalId/decide` - Approve/reject

### Audit Logs

- `GET /api/v1/audit-logs` - List logs (with filters)
- `GET /api/v1/audit-logs/:auditId` - Get log

### Validation

- `POST /api/v1/validation/condition-tree` - Validate condition tree

## Query Parameters

### Pagination

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Example: `GET /api/v1/rules?page=2&limit=20`

### Filtering

Each endpoint supports filtering by its relevant fields:

- **Rules**: `rule_type`, `status`, `created_by`
- **RuleSets**: `scope_id`, `rule_type`, `status`
- **Approvals**: `status`, `entity_type`
- **Audit Logs**: `entity_type`, `entity_id`, `action`, `performed_by`

Example: `GET /api/v1/rules?rule_type=NEGATIVE&status=APPROVED`

## Mock Users

Four mock users are available:

```typescript
// Makers
maker1 / any password  // John Maker (user_maker_1)
maker2 / any password  // Jane Maker (user_maker_2)

// Checkers
checker1 / any password  // Bob Checker (user_checker_1)
checker2 / any password  // Alice Checker (user_checker_2)
```

Default logged-in user: `maker1`

## Disabling MSW

MSW is only enabled in development mode. In production builds, it's automatically excluded.

To temporarily disable in development, comment out the import in `src/main.tsx`:

```typescript
// const { startMockServiceWorker } = await import('./mocks');
// await startMockServiceWorker();
```

## Troubleshooting

### MSW not starting

- Check browser console for errors
- Verify `public/mockServiceWorker.js` exists
- Clear browser cache and reload

### Requests not being intercepted

- Check Network tab - mocked requests show as "from ServiceWorker"
- Verify request URL matches handler patterns exactly
- Check for MSW startup message in console

### Data not persisting

- MSW stores are session-based; data resets on page reload
- For persistent data across reloads, modify stores to use localStorage

## Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW Browser Setup](https://mswjs.io/docs/integrations/browser)
- [MSW Recipes](https://mswjs.io/docs/recipes)
