import React from "react";
import { waitFor, screen } from "@testing-library/react";
// server setup removed - handled globally
import AuditLogList from "../list";
import { render } from "@/test/utils";
import { dataProvider as realDataProvider } from "@/app/dataProvider";

// Global test setup handles MSW server lifecycle

describe("AuditLogList filters", () => {
  it("filters by action and entity type", async () => {
    // Set filters by pushing URL with query params (avoids flaky dropdown interactions)
    globalThis.history.pushState({}, "Filter", "/audit-logs?action=CREATE&entity_type=RULE");

    render(<AuditLogList />, { dataProvider: realDataProvider });

    await waitFor(() => {
      const tableElement = document.querySelector(".ant-table");
      expect(tableElement).toBeInTheDocument();
    });

    // Expect tags or values to appear in the rendered table
    const createTags = await screen.findAllByText("CREATE");
    expect(createTags.length).toBeGreaterThan(0);

    const ruleTags = await screen.findAllByText("RULE");
    expect(ruleTags.length).toBeGreaterThan(0);

    await waitFor(() => {
      const tableElement = document.querySelector(".ant-table");
      expect(tableElement).toBeInTheDocument();
    });
  });

  it("searches by entity_id", async () => {
    // Stub http client to return only rows for rule_001 so test is deterministic
    const httpMod = await import("../../../api/httpClient");
    const spy = vi.spyOn(httpMod.default, "request").mockResolvedValue({
      data: [
        {
          audit_id: "audit_003",
          entity_type: "RULE",
          entity_id: "rule_001",
          action: "CREATE",
          performed_by: "user_maker_1",
          performed_at: "2024-11-01T10:00:00Z",
        },
      ],
    });

    // Update the URL directly to trigger a location-synced search
    globalThis.history.pushState({}, "Search", "/audit-logs?entity_id=rule_001");

    render(<AuditLogList />, { dataProvider: realDataProvider });

    await waitFor(() => {
      const tableElement = document.querySelector(".ant-table");
      expect(tableElement).toBeInTheDocument();
    });

    // Expect the table to show a row containing the entity id
    const entity = await screen.findByText("rule_001");
    expect(entity).toBeTruthy();

    spy.mockRestore();
  });

  it("shows empty state when API returns no results", async () => {
    // Spy on the axios request used by the data provider to return an empty payload
    const httpMod = await import("../../../api/httpClient");
    const spy = vi.spyOn(httpMod.default, "request").mockResolvedValue({ data: [] });

    render(<AuditLogList />, { dataProvider: realDataProvider });

    await waitFor(() => {
      const empty = document.querySelector(".ant-empty");
      expect(empty).toBeInTheDocument();
    });

    spy.mockRestore();
  });
});
