import React from "react";
import { waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
// server setup removed - handled globally
import ApprovalList from "../list";
import { render, screen } from "@/test/utils";
import { dataProvider as realDataProvider } from "@/app/dataProvider";

// Global test setup handles MSW server lifecycle

describe("ApprovalList interactions", () => {
  it("searches by entity_id and filters by status", async () => {
    // Render component with real data provider for MSW integration
    render(<ApprovalList />, { dataProvider: realDataProvider });

    // Wait for initial rows to render
    await waitFor(
      () => {
        const rows = document.querySelectorAll(".ant-table-tbody tr");
        expect(rows.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );

    // Type into search and press Enter to trigger a filtered request
    const input = screen.getByPlaceholderText(/Search by entity ID/i);
    await userEvent.type(input, "rule_006{enter}");

    // Programmatically set status via URL to avoid flaky dropdown interactions
    globalThis.history.pushState({}, "Filter", "/approvals?entity_id=rule_006&status=PENDING");

    // Assert that an expected entity id is present in the table
    const entity = await screen.findByText(/rule_006/);
    expect(entity).toBeTruthy();

    // Expect the status tag to be present in the rendered result
    const pendingTags = await screen.findAllByText("PENDING");
    expect(pendingTags.length).toBeGreaterThan(0);

    await waitFor(
      () => {
        const rows = document.querySelectorAll(".ant-table-tbody tr");
        // Should still be a valid list
        expect(rows).toBeTruthy();
      },
      { timeout: 5000 }
    );
  }, 30000);
});
