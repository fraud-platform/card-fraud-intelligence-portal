import React from "react";
import { waitFor } from "@testing-library/react";
// server setup removed - handled globally
import ApprovalList from "../list";
import { render } from "@/test/utils";
import { dataProvider } from "@/app/dataProvider";

// Global test setup handles MSW server lifecycle

describe("Approvals integration", () => {
  it("renders the list and shows rows from MSW", async () => {
    render(<ApprovalList />, { dataProvider });

    await waitFor(() => {
      const rows = document.querySelectorAll(".ant-table-tbody tr");
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  it("creates an approval and can decide (approve) via API", async () => {
    // Create approval
    const createRes = await fetch("/api/v1/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity_type: "RULE",
        entity_id: "rule_123",
        action: "SUBMIT",
      }),
    });

    expect(createRes.ok).toBeTruthy();
    const created = await createRes.json();
    expect(created.approval_id).toBeTruthy();
    expect(created.status).toBe("PENDING");

    // Decide (approve)
    const decideRes = await fetch(`/api/v1/approvals/${created.approval_id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED", remarks: "Looks good" }),
    });

    expect(decideRes.ok).toBeTruthy();
    const decided = await decideRes.json();
    expect(decided.status).toBe("APPROVED");

    // Confirm by fetching the approval
    const getRes = await fetch(`/api/v1/approvals/${created.approval_id}`);
    const getJson = await getRes.json();
    expect(getJson.status).toBe("APPROVED");
  });
});
