import React from "react";
import { waitFor } from "@testing-library/react";
// server setup removed - handled globally
import RuleFieldList from "../list";
import { render } from "@/test/utils";
import { dataProvider } from "@/app/dataProvider";

// Global test setup handles MSW server lifecycle

describe("RuleFieldList integration", () => {
  it("renders table and shows rows from MSW", async () => {
    render(<RuleFieldList />, { dataProvider });

    await waitFor(() => {
      const rows = document.querySelectorAll(".ant-table-tbody tr");
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  it("creates and deletes a rule field via API and reflects changes", async () => {
    // Create a new rule field via the API
    const createRes = await fetch("/api/v1/rule-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_key: "integ_field_x",
        display_name: "Integ Field X",
        data_type: "STRING",
        allowed_operators: ["EQ"],
        is_active: true,
      }),
    });

    expect(createRes.ok).toBeTruthy();

    const created = await createRes.json();
    expect(created.field_key).toBe("integ_field_x");

    // Verify the API returns the created item (UI pagination can hide newly added items)
    const listAfterCreate = await fetch("/api/v1/rule-fields?limit=100");
    const listAfterCreateJson = await listAfterCreate.json();
    expect(
      listAfterCreateJson.items.find((f: any) => f.field_key === created.field_key)
    ).toBeTruthy();

    // Delete the newly created field
    const del = await fetch(`/api/v1/rule-fields/${created.field_key}`, { method: "DELETE" });
    expect(del.ok).toBeTruthy();

    // Verify it's no longer present via list API
    const listRes = await fetch("/api/v1/rule-fields?limit=100");
    const listData = await listRes.json();
    expect(listData.items.find((f: any) => f.field_key === created.field_key)).toBeUndefined();
  });
});
