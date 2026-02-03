import React from "react";
import { Routes, Route } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@/test/utils";

import { ApprovalShow } from "../show";
import * as http from "../../../api/httpClient";
import * as authProvider from "../../../app/authProvider";

describe("ApprovalShow component", () => {
  const approvalId = "appr_test_1";
  const approvalResp = {
    approval: {
      approval_id: approvalId,
      entity_type: "RULE",
      entity_id: "rule_1",
      action: "SUBMIT",
      maker: "maker1",
      status: "PENDING",
      created_at: "2025-01-01T00:00:00Z",
    },
    entity_data: {
      entity_id: "rule_1",
      entity_name: "Test Rule 1",
      new_value: { foo: "bar" },
    },
  } as any;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders details and allows a checker to approve successfully", async () => {
    // Mock isChecker to true
    vi.spyOn(authProvider, "isChecker").mockReturnValue(true);

    // Mock get and post
    const getSpy = vi.spyOn(http, "get" as any).mockResolvedValue(approvalResp);
    const postSpy = vi.spyOn(http, "post" as any).mockResolvedValue({});

    // We avoid spying on useNavigate (non-configurable in this environment).
    const openMock = vi.fn();

    render(
      <Routes>
        <Route path="/approvals/show/:id" element={<ApprovalShow />} />
      </Routes>,
      {
        initialRoute: `/approvals/show/${approvalId}`,
        notificationProvider: { open: openMock, close: () => {} },
      }
    );

    // Wait for content to load
    await waitFor(() =>
      expect(screen.getByText(new RegExp(`Approval: ${approvalId}`))).toBeInTheDocument()
    );

    // Approve button should be present
    const approveBtn = screen.getByRole("button", { name: /approve/i });
    expect(approveBtn).toBeInTheDocument();

    // Open modal and confirm
    await userEvent.click(approveBtn);

    // Confirm button in modal (use dialog context to disambiguate)
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: /approve$/i });
    await userEvent.click(confirm);

    // Post should have been called
    await waitFor(() => expect(postSpy).toHaveBeenCalled());

    // Notification success
    await waitFor(() =>
      expect(openMock).toHaveBeenCalledWith(expect.objectContaining({ type: "success" }))
    );

    getSpy.mockRestore();
    postSpy.mockRestore();
  }, 30000);

  it("shows error notification if approve fails", async () => {
    vi.spyOn(authProvider, "isChecker").mockReturnValue(true);
    vi.spyOn(http, "get" as any).mockResolvedValue(approvalResp);
    const postSpy = vi.spyOn(http, "post" as any).mockRejectedValue(new Error("boom"));

    const openMock = vi.fn();
    render(
      <Routes>
        <Route path="/approvals/show/:id" element={<ApprovalShow />} />
      </Routes>,
      {
        initialRoute: `/approvals/show/${approvalId}`,
        notificationProvider: { open: openMock, close: () => {} },
      }
    );

    await waitFor(() =>
      expect(screen.getByText(new RegExp(`Approval: ${approvalId}`))).toBeInTheDocument()
    );

    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: /approve$/i });
    await userEvent.click(confirm);

    await waitFor(() => expect(postSpy).toHaveBeenCalled());
    await waitFor(() =>
      expect(openMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }))
    );

    postSpy.mockRestore();
  });

  it("hides decision buttons for non-checker users", async () => {
    vi.spyOn(authProvider, "isChecker").mockReturnValue(false);
    vi.spyOn(http, "get" as any).mockResolvedValue(approvalResp);

    render(
      <Routes>
        <Route path="/approvals/show/:id" element={<ApprovalShow />} />
      </Routes>,
      { initialRoute: `/approvals/show/${approvalId}` }
    );

    await waitFor(() =>
      expect(screen.getByText(new RegExp(`Approval: ${approvalId}`))).toBeInTheDocument()
    );

    expect(screen.queryByRole("button", { name: /approve/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /reject/i })).toBeNull();
  });

  it('shows "Approval not found" when GET fails', async () => {
    vi.spyOn(http, "get" as any).mockRejectedValue(new Error("Not found"));
    const openMock = vi.fn();

    render(
      <Routes>
        <Route path="/approvals/show/:id" element={<ApprovalShow />} />
      </Routes>,
      {
        initialRoute: `/approvals/show/${approvalId}`,
        notificationProvider: { open: openMock, close: () => {} },
      }
    );

    await waitFor(() => expect(screen.getByText(/Approval not found/i)).toBeInTheDocument());

    // error notification should have been shown
    await waitFor(() =>
      expect(openMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }))
    );
  });
});
