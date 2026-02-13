# Code Patterns

Standard coding patterns and conventions for the Card Fraud Intelligence Portal.

**Last Updated**: 2026-01-27

---

## Table of Contents

1. [Component Patterns](#component-patterns)
2. [Hook Patterns](#hook-patterns)
3. [Data Patterns](#data-patterns)
4. [Utility Patterns](#utility-patterns)
5. [Testing Patterns](#testing-patterns)
6. [Anti-Patterns](#anti-patterns)

---

## Component Patterns

### List Component Pattern

```typescript
// src/resources/rules/list.tsx
import { List, useTable } from "@refinedev/core";
import { Table } from "antd";
import { useMemo } from "react";

export const RuleList = () => {
  const { tableProps, filters } = useTable<Rule>({
    syncWithLocation: true,
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
  });

  // Memoize columns to prevent re-renders
  const columns = useMemo(() => [
    {
      title: "Name",
      dataIndex: "rule_name",
      key: "rule_name",
      sorter: true,
    },
    // ... more columns
  ], []);

  return (
    <List>
      <Table {...tableProps} columns={columns} rowKey="rule_id" />
    </List>
  );
};
```

### Form Component Pattern

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
        <Form.Item
          label="Rule Name"
          name="rule_name"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input placeholder="Enter rule name" />
        </Form.Item>
      </Form>
    </Create>
  );
};
```

### Show Component Pattern

```typescript
// src/resources/rules/show.tsx
import { Show, useOne } from "@refinedev/core";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export const RuleShow = () => {
  const { data, isLoading } = useOne<Rule>({
    resource: "rules",
    id: ruleId,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Show>
      <Title level={5}>{data?.rule_name}</Title>
      <Paragraph>{data?.description}</Paragraph>
    </Show>
  );
};
```

### Modal Component Pattern

```typescript
// src/components/modal/ActionModal.tsx
import { Modal } from "antd";

interface ActionModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  loading?: boolean;
}

export const ActionModal = ({
  visible,
  onCancel,
  onConfirm,
  title,
  loading = false,
}: ActionModalProps) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      confirmLoading={loading}
    >
      {/* Modal content */}
    </Modal>
  );
};
```

---

## Hook Patterns

### Custom Hook Pattern

```typescript
// src/hooks/useReview.ts
import { useOne, useUpdate, useInvalidate } from "@refinedev/core";
import { useCallback } from "react";

export const useReview = (transactionId: string) => {
  const { data: review, isLoading } = useOne({
    resource: "reviews",
    id: transactionId,
  });

  const { mutate } = useUpdate();
  const invalidate = useInvalidate();

  const updateStatus = useCallback(
    (status: TransactionStatus) => {
      mutate(
        {
          resource: "reviews",
          id: transactionId,
          values: { status },
        },
        {
          onSuccess: () => {
            invalidate({ resource: "reviews" });
          },
        }
      );
    },
    [mutate, invalidate, transactionId]
  );

  return {
    review,
    isLoading,
    updateStatus,
  };
};
```

### Modal State Hook Pattern

```typescript
// src/shared/hooks/useModalAction.ts
import { useState, useCallback } from "react";

export const useModalAction = () => {
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  return {
    visible,
    open,
    close,
  };
};
```

### Modal with Data Hook Pattern

```typescript
// src/shared/hooks/useModalWithData.ts
import { useState, useCallback } from "react";

export const useModalWithData = <T>() => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((item: T) => {
    setData(item);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setData(null);
  }, []);

  return {
    visible,
    data,
    open,
    close,
  };
};
```

---

## Data Patterns

### Memoization Pattern

```typescript
// Memoize columns
const columns = useMemo(
  () => [
    { title: "Name", dataIndex: "name" },
    { title: "Status", dataIndex: "status" },
  ],
  []
);

// Memoize filters
const filters = useMemo(
  () => ({
    status: statusFilter,
    risk_level: riskFilter,
  }),
  [statusFilter, riskFilter]
);

// Memoize handlers
const handleClick = useCallback(
  () => {
    // Handle click
  },
  [
    /* dependencies */
  ]
);
```

### Data Fetching Pattern

```typescript
// Fetch single item
const { data, isLoading, error } = useOne<Rule>({
  resource: "rules",
  id: ruleId,
  queryOptions: {
    enabled: !!ruleId,
    staleTime: 5000,
  },
});

// Fetch list
const { tableProps } = useTable<Rule>({
  syncWithLocation: true,
  sorters: { initial: [{ field: "created_at", order: "desc" }] },
  filters: {
    initial: [{ field: "status", operator: "eq", value: "DRAFT" }],
  },
});
```

### Mutation Pattern

```typescript
const { mutate, isLoading } = useUpdate();

const handleSubmit = (values: RuleUpdate) => {
  mutate(
    {
      resource: "rules",
      id: ruleId,
      values,
    },
    {
      onSuccess: () => {
        notification.success({ message: "Rule updated" });
        invalidate({ resource: "rules" });
      },
      onError: (error) => {
        notification.error({ message: "Update failed" });
      },
    }
  );
};
```

---

## Utility Patterns

### Error Handling Pattern

```typescript
// src/shared/utils/errors.ts
export const handleAsyncError = (error: unknown, fallbackMsg: string): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMsg);
};

// Usage
try {
  await riskyOperation();
} catch (error) {
  const err = handleAsyncError(error, "Operation failed");
  message.error(err.message);
}
```

### Filter Builder Pattern

```typescript
// src/shared/utils/filters.ts
export const buildFilters = (filters: Record<string, unknown>) => {
  return Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== "")
    .map(([field, value]) => ({
      field,
      operator: "eq",
      value,
    }));
};
```

### Type Guard Pattern

```typescript
// src/shared/utils/guards.ts
export const isRule = (value: unknown): value is Rule => {
  return typeof value === "object" && value !== null && "rule_id" in value && "rule_name" in value;
};

// Usage
if (isRule(data)) {
  console.log(data.rule_id); // TypeScript knows this is safe
}
```

---

## Testing Patterns

### Component Test Pattern

```typescript
// src/resources/rules/list.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { RuleList } from "./list";

describe("RuleList", () => {
  it("renders rules table", () => {
    render(<RuleList />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("filters by status", async () => {
    const { user } = render(<RuleList />);
    await user.click(screen.getByLabelText("Status"));
    await user.click(screen.getByText("DRAFT"));
    // Assert filtered results
  });
});
```

### Hook Test Pattern

```typescript
// src/hooks/useReview.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReview } from "./useReview";

describe("useReview", () => {
  it("fetches review data", async () => {
    const { result } = renderHook(() => useReview("txn-123"));
    await waitFor(() => {
      expect(result.current.review).toBeDefined();
    });
  });
});
```

### Utility Test Pattern

```typescript
// src/shared/utils/conditionTree.test.ts
import { describe, it, expect } from "vitest";
import { conditionNodeToPersistedTree } from "./conditionTree";

describe("conditionNodeToPersistedTree", () => {
  it("converts simple predicate", () => {
    const input = {
      kind: "predicate",
      field: "amount",
      op: "GT",
      value: 100,
    };
    const result = conditionNodeToPersistedTree(input);
    expect(result).toEqual({ field: "amount", op: "GT", value: 100 });
  });
});
```

---

## Anti-Patterns

### ❌ Don't: Non-memoized columns

```typescript
// BAD: Columns recreated on every render
const columns = [{ title: "Name", dataIndex: "name" }];
```

### ✅ Do: Memoize columns

```typescript
// GOOD: Columns created once
const columns = useMemo(() => [{ title: "Name", dataIndex: "name" }], []);
```

### ❌ Don't: Inline handlers

```typescript
// BAD: New function on every render
<Button onClick={() => handleClick(id)} />
```

### ✅ Do: Memoize handlers

```typescript
// GOOD: Function is stable
const handleClick = useCallback(() => {
  // Handle click
}, [id]);

<Button onClick={handleClick} />
```

### ❌ Don't: Any types

```typescript
// BAD: Loses type safety
const data: any = await fetchData();
```

### ✅ Do: Proper types

```typescript
// GOOD: Type safe
const data: Rule = await fetchData();
// Or use unknown with type guards
const data: unknown = await fetchData();
if (isRule(data)) {
  // Use data as Rule
}
```

### ❌ Don't: Deep nesting

```typescript
// BAD: Hard to read and maintain
const value = props?.data?.rule?.version?.condition;
```

### ✅ Do: Extract and validate

```typescript
// GOOD: Clear and validated
const rule = extractRule(props.data);
const version = rule?.currentVersion;
const condition = version?.condition_tree;
```

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

## Next Steps

- **Workflow**: See [Development Workflow](./workflow.md)
- **Architecture**: See [Architecture Overview](./architecture.md)
- **Code Map**: See [Code Map](../codemap.md)
- **Testing**: See [Testing Guide](../04-testing/README.md)
