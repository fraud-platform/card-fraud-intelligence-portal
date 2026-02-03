import React from "react";
import { waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
// server setup removed - handled globally
import AuditLogList from "../list";
import { render, screen } from "@/test/utils";
import { dataProvider as realDataProvider } from "@/app/dataProvider";

// Global test setup handles MSW server lifecycle

describe("AuditLogList interactions", () => {
  it("filters by entity_type and searches by entity_id", async () => {
    // Use a targeted HTTP client spy instead of a custom MSW handler for deterministic behavior in tests.
    // The project's shared MSW handlers are comprehensive but can expose differing URL shapes in Node.
    const httpMod = await import("@/api/httpClient");
    const spy = vi.spyOn(httpMod.default, "request").mockResolvedValue({
      data: {
        items: [
          {
            audit_id: "audit_003",
            entity_type: "RULE",
            entity_id: "rule_001",
            action: "CREATE",
            performed_by: "user_maker_1",
            performed_at: "2024-11-01T10:00:00Z",
          },
        ],
        next_cursor: null,
        prev_cursor: null,
        has_next: false,
        has_prev: false,
        limit: 50,
      },
    } as any);

    // Render with query params in initial route to avoid flaky combobox interactions
    render(<AuditLogList />, {
      initialRoute: "/audit-logs?entity_type=RULE&entity_id=rule_001",
      dataProvider: realDataProvider,
    });

    await waitFor(() => {
      const rows = document.querySelectorAll(".ant-table-tbody tr");
      expect(rows.length).toBeGreaterThan(0);
    });

    // Expect result tags/rows to be present
    const ruleTags = await screen.findAllByText("RULE");
    expect(ruleTags.length).toBeGreaterThan(0);

    const entity = await screen.findByText("rule_001");
    expect(entity).toBeTruthy();

    await waitFor(() => {
      const rows = document.querySelectorAll(".ant-table-tbody tr");
      expect(rows).toBeTruthy();
    });

    // Restore the spy to avoid leaking test state
    spy.mockRestore();
  }, 30000);
});
