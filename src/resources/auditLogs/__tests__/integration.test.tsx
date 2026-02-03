import { beforeEach, describe, it, expect, vi } from "vitest";
import { http } from "msw";
import AuditLogList from "../list";
import AuditLogShow from "../show";
import { render, screen, waitFor } from "@/test/utils";
import { dataProvider } from "@/app/dataProvider";
import { Routes, Route } from "react-router";

// Use shared server instance
import { server } from "@/test/server";

// Apply runtime handlers before each test so they persist after global resetHandlers
beforeEach(() => {
  // Allow OPTIONS preflight during axios requests by handling them globally
  server.use(
    http.options("*", async () => {
      return new Response(null, { status: 204 });
    })
  );
});

describe("Audit Logs integration", () => {
  it("renders list and shows rows from MSW", async () => {
    render(<AuditLogList />, { dataProvider });

    await waitFor(() => {
      const rows = document.querySelectorAll(".ant-table-tbody tr");
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  it("filters by entity_type via the API and shows only matching entries", async () => {
    const res = await fetch("/api/v1/audit-log?entity_type=RULE&limit=100");
    expect(res.ok).toBeTruthy();
    const json = await res.json();
    expect(json.items.length).toBeGreaterThan(0);
    expect(json.items.every((d: any) => d.entity_type === "RULE")).toBeTruthy();
  });

  it("renders the show page for an existing audit log entry (mocked GET)", async () => {
    // Get a sample audit log entry from the API
    const res = await fetch("/api/v1/audit-log?limit=1");
    const json = await res.json();
    const item = json.items?.[0];
    const id = item?.audit_id;
    expect(id).toBeTruthy();

    // Mock the httpClient.get call used by the component to return the item
    const module = await import("../../../api/httpClient");
    const spy = vi.spyOn(module, "get" as any).mockResolvedValue(item);

    // Render using a proper Route so useParams is populated
    render(
      <Routes>
        <Route path="/audit-logs/show/:id" element={<AuditLogShow />} />
      </Routes>,
      { initialRoute: `/audit-logs/show/${id}`, dataProvider }
    );

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Audit Log: ${id}`))).toBeInTheDocument();
    });

    spy.mockRestore();
  });
});
