# Development Workflow

Daily development patterns and workflows for the Card Fraud Intelligence Portal.

**Last Updated**: 2026-01-27

---

## Table of Contents

1. [Daily Workflow](#daily-workflow)
2. [Quality Gates](#quality-gates)
3. [Git Workflow](#git-workflow)
4. [Code Patterns](#code-patterns)
5. [Common Tasks](#common-tasks)
6. [Debugging](#debugging)

---

## Daily Workflow

### Starting Development

```powershell
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if package.json changed)
pnpm install

# 3. Start development server with Doppler
doppler run -- pnpm dev

# 4. In another terminal, run tests in watch mode
doppler run -- pnpm test:watch
```

### Quality Gates Before Committing

```powershell
# 1. Type check (must pass)
doppler run -- pnpm type-check

# 2. Lint (must pass, 0 errors)
doppler run -- pnpm lint

# 3. Run unit tests (fast mode)
doppler run -- pnpm test:fast

# 4. Run E2E tests if UI changed
doppler run -- pnpm test:e2e
```

### Pre-Commit Hooks

The project uses Husky and lint-staged for pre-commit automation:

**`.husky/pre-commit`**:

```bash
pnpm lint-staged
```

**`lintstagedrc.json`**:

```json
{
  "*.{ts,tsx}": ["eslint --fix"],
  "*.{json,md}": ["prettier --write"]
}
```

---

## Quality Gates

| Check      | Command              | Threshold       | Status   |
| ---------- | -------------------- | --------------- | -------- |
| TypeScript | `pnpm type-check`    | 0 errors        | Required |
| ESLint     | `pnpm lint`          | 0 errors        | Required |
| Unit Tests | `pnpm test:fast`     | All pass        | Required |
| E2E Tests  | `pnpm test:e2e`      | All pass        | Required |
| Coverage   | `pnpm test:coverage` | 80% all metrics | CI only  |

---

## Git Workflow

### Branch Strategy

| Branch       | Purpose             | Protection                 |
| ------------ | ------------------- | -------------------------- |
| `main`       | Production code     | Require PR, require checks |
| `feature/*`  | Feature development | None                       |
| `fix/*`      | Bug fixes           | None                       |
| `refactor/*` | Refactoring         | None                       |

### Commit Guidelines

Use clear, descriptive commit messages:

```
feat: add rule version comparison in approvals list
fix: prevent duplicate rule names in create form
docs: update API endpoint documentation
refactor: simplify condition tree validation logic
test: add E2E tests for ruleset compilation
chore: upgrade ant-design to 5.12.0
perf: memoize table columns in worklist list
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Update documentation if needed
4. Run all quality gates
5. Create PR with:
   - Clear description of changes
   - Link to related issue/TODO
   - Screenshots for UI changes
6. Request review from team member
7. Address review feedback
8. Merge after approval

---

## Code Patterns

### 1. Resource Screen Pattern

Each resource follows this structure:

```
resources/{resourceName}/
├── list.tsx          # useTable with filters
├── create.tsx        # useForm (maker only)
├── edit.tsx          # useForm with versioning (maker only)
├── show.tsx          # Read-only detail view
├── filters.ts        # Filter configuration
└── components/       # Resource-specific components
```

### 2. List View Pattern

```typescript
// src/resources/rules/list.tsx
import { List, useTable } from "@refinedev/core";
import { Table } from "antd";

export const RuleList = () => {
  const { tableProps, filters } = useTable<Rule>({
    syncWithLocation: true,
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="rule_id" />
    </List>
  );
};
```

### 3. Form Pattern (Create/Edit)

```typescript
// src/resources/rules/create.tsx
import { Create, useForm } from "@refinedev/core";
import { Form, Input, Button } from "antd";

export const RuleCreate = () => {
  const { formProps, saveButtonProps } = useForm<Rule>({
    successNotification: "Rule created successfully",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Rule Name" name="rule_name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
```

### 4. Edit with Versioning Pattern

```typescript
// src/resources/rules/edit.tsx
import { useGo, useInvalidate } from "@refinedev/core";

export const RuleEdit = () => {
  const invalidate = useInvalidate();
  const go = useGo();

  const { mutate, isLoading } = useCreate();

  const handleSubmit = (values: RuleVersionCreate) => {
    mutate(
      {
        resource: `/rules/${ruleId}/versions`,
        values,
      },
      {
        onSuccess: () => {
          invalidate({ resource: "rules" });
          go({ to: "/rules", type: "push" });
        },
      }
    );
  };

  return <Form onSubmit={handleSubmit} />;
};
```

### 5. Authorization Check Pattern

```typescript
// src/resources/rules/edit.tsx
import { useCan, useGo } from "@refinedev/core";
import { useEffect } from "react";

export const RuleEdit = () => {
  const { data: canEdit } = useCan({
    resource: "rules",
    action: "edit",
    params: { id: ruleId },
  });

  const go = useGo();

  useEffect(() => {
    if (canEdit === false) {
      go({ to: "/rules", type: "replace" });
    }
  }, [canEdit, go]);

  if (!canEdit) return null;

  // Render edit form...
};
```

### 6. Status-Based Gating Pattern

```typescript
const isImmutable = rule?.status === RuleStatus.APPROVED;

<Button
  type="primary"
  disabled={isImmutable}
  onClick={handleEdit}
>
  Edit Rule
</Button>

{isImmutable && (
  <Alert
    type="info"
    message="Approved rules cannot be edited. Create a new version instead."
  />
)}
```

### 7. Memoization Pattern

```typescript
// Memoize column definitions to prevent re-renders
const columns = useMemo(
  () => [
    {
      title: "Name",
      dataIndex: "rule_name",
      key: "rule_name",
      sorter: true,
    },
    // ... more columns
  ],
  []
);

// Memoize filter objects
const filters = useMemo(
  () => ({
    status: statusFilter,
    risk_level: riskFilter,
  }),
  [statusFilter, riskFilter]
);

// Memoize handlers
const handleStatusChange = useCallback(
  async (status: TransactionStatus) => {
    await updateStatus({ status });
  },
  [updateStatus]
);
```

### 8. Custom Hook Pattern

```typescript
// src/hooks/useReview.ts
export const useReview = (transactionId: string) => {
  const { data: review, isLoading } = useOne({
    resource: "reviews",
    id: transactionId,
  });

  const { mutate } = useUpdate();

  const updateStatus = useCallback(
    (status: TransactionStatus) => {
      mutate({
        resource: "reviews",
        id: transactionId,
        values: { status },
      });
    },
    [mutate, transactionId]
  );

  return {
    review,
    isLoading,
    updateStatus,
  };
};
```

---

## Common Tasks

### Adding a New Field to a Form

```typescript
// 1. Update type if needed
interface RuleCreateInput {
  rule_name: string;
  new_field: string; // Add here
}

// 2. Add to form
<Form.Item
  label="New Field"
  name="new_field"
  rules={[{ required: true, message: "Required" }]}
>
  <Input />
</Form.Item>
```

### Adding a Filter to List View

```typescript
const { tableProps, search } = useTable({
  filters: {
    initial: [
      { field: "status", operator: "eq", value: "DRAFT" },
    ],
  },
});

// In filter component
<Select
  onChange={(value) => search([{
    field: "status",
    operator: "eq",
    value,
  }])}
>
  <Select.Option value="DRAFT">Draft</Select.Option>
  <Select.Option value="APPROVED">Approved</Select.Option>
</Select>
```

### Adding a New API Endpoint

```typescript
// 1. Add to src/api/endpoints.ts
export const MY_RESOURCE = {
  LIST: "/api/v1/my-resource",
  CREATE: "/api/v1/my-resource",
  GET: (id: string) => `/api/v1/my-resource/${id}`,
};

// 2. Add types to src/api/types.ts
export interface MyResource {
  id: string;
  name: string;
}

// 3. Use in component
const { data } = useOne<MyResource>({
  resource: MY_RESOURCE.GET(id),
});
```

### Creating a New Resource

1. **Create directory**: `src/resources/myResource/`
2. **Create files**: `list.tsx`, `create.tsx`, `edit.tsx`, `show.tsx`
3. **Add routes**: Update `src/app/routes.tsx`
4. **Add endpoints**: Update `src/api/endpoints.ts`
5. **Add types**: Update `src/api/types.ts`
6. **Add to dataProvider**: Update `src/app/dataProvider.ts`
7. **Add tests**: Create `__tests__/` directory
8. **Add E2E**: Create `e2e/my-resource.spec.ts`

### Debugging API Calls

```typescript
// In src/app/dataProvider.ts
const response = await httpClient({
  url,
  method,
  data,
  headers: {
    // Add debugging
    "X-Debug": "true",
  },
});

console.debug("[API]", method, url, data, response);
```

---

## Debugging

### Vitest Debug Mode

```powershell
# Run with inspector
doppler run -- pnpm test -- --inspect-brk --no-coverage
```

### Playwright Debug Mode

```powershell
# Run with debug UI
doppler run -- pnpm test:e2e:debug

# Run headed with slow motion
$env:HEADLESS="false"; doppler run -- pnpm test:e2e
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Vitest Debug",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--inspect-brk", "--no-coverage"],
      "console": "integratedTerminal"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### Browser DevTools

1. **React DevTools**: Install for component inspection
2. **Redux DevTools**: Not needed (using React Query)
3. **Network Tab**: Check API calls
4. **Console**: Check for errors and warnings

---

## File Naming Conventions

| Type       | Convention                  | Example                   |
| ---------- | --------------------------- | ------------------------- |
| Components | PascalCase                  | `ConditionBuilder.tsx`    |
| Utilities  | camelCase                   | `conditionTree.ts`        |
| Types      | camelCase                   | `domain.ts`               |
| Hooks      | camelCase with `use` prefix | `useEditAuthorization.ts` |
| Constants  | PascalCase for objects      | `RuleStatus.ts`           |
| Tests      | Same as file + `.test.ts`   | `conditionTree.test.ts`   |
| E2E Tests  | kebab-case + `.spec.ts`     | `rules.spec.ts`           |

---

## Import Order

```typescript
// 1. External libraries
import React from "react";
import { Button } from "antd";

// 2. Refine imports
import { useTable } from "@refinedev/core";

// 3. Internal imports - grouped
import { Rule } from "@/types/domain";
import { useForm } from "@/hooks/useForm";

// 4. Relative imports
import { ConditionBuilder } from "./components";
```

---

## Performance Guidelines

### Memoization Rules

1. **Use useMemo** for:
   - Column definitions in tables
   - Filter objects
   - Computed values from props

2. **Use useCallback** for:
   - Event handlers passed to child components
   - Mutation callbacks
   - Functions used as dependencies

3. **Avoid premature optimization**:
   - Only optimize after measuring
   - Use React DevTools Profiler

### Bundle Size

```powershell
# Analyze bundle size
doppler run -- pnpm build
# Check dist/ for size report
```

---

## Next Steps

- **Architecture**: See [Architecture Overview](./architecture.md)
- **Code Map**: See [Code Map](../codemap.md)
- **Patterns**: See [Code Patterns](./patterns.md)
- **Testing**: See [Testing Guide](../04-testing/README.md)
- **API**: See [API Overview](../03-api/README.md)
