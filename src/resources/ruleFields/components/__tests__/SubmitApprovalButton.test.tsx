/**
 * Tests for SubmitApprovalButton component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { SubmitApprovalButton } from "../SubmitApprovalButton";
import { fieldDefinitionsApi } from "@/api/fieldDefinitions";
import type { FieldVersion } from "@/types/fieldDefinitions";

// Mock the API
vi.mock("@/api/fieldDefinitions", () => ({
  fieldDefinitionsApi: {
    submitVersion: vi.fn(),
  },
}));

// Mock Refine hooks
vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...actual,
    useInvalidate: vi.fn(() => vi.fn()),
    useNotification: vi.fn(() => ({
      open: vi.fn(),
    })),
  };
});

describe("SubmitApprovalButton", () => {
  const mockVersionId = "version-123";
  const mockFieldKey = "test_field";

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    vi.mocked(fieldDefinitionsApi.submitVersion).mockResolvedValue({
      rule_field_version_id: mockVersionId,
      field_key: mockFieldKey,
      version: 1,
      field_id: 100,
      display_name: "Test Field",
      status: "PENDING_APPROVAL",
      created_by: "user1",
      created_at: "2024-01-15T10:00:00Z",
      data_type: "STRING",
      allowed_operators: ["EQ", "IN"],
      multi_value_allowed: false,
      is_sensitive: false,
    } as FieldVersion);
  });

  it("renders button with correct label", () => {
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    expect(screen.getByRole("button", { name: /submit for approval/i })).toBeInTheDocument();
  });

  it("shows confirmation modal on click", async () => {
    const user = userEvent.setup();
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText("Submit Field Version for Approval")).toBeInTheDocument();
      expect(
        screen.getByText(/are you sure you want to submit this field version for approval?/i)
      ).toBeInTheDocument();
    });
  });

  it("calls onSubmit when confirmed", async () => {
    const user = userEvent.setup();
    render(<SubmitApprovalButton versionId={mockVersionId} fieldKey={mockFieldKey} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Click confirm in modal
    await waitFor(() => {
      const confirmButton = screen.getByRole("button", { name: "Submit" });
      return confirmButton;
    });

    const confirmButton = screen.getByRole("button", { name: "Submit" });
    await user.click(confirmButton);

    // API should be called
    await waitFor(() => {
      expect(fieldDefinitionsApi.submitVersion).toHaveBeenCalledWith(
        mockVersionId,
        expect.any(Object)
      );
    });
  });

  it("submits without remarks when remarks are empty", async () => {
    const user = userEvent.setup();
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Click confirm without entering remarks
    await waitFor(() => {
      const confirmButton = screen.getByRole("button", { name: "Submit" });
      return confirmButton;
    });

    const confirmButton = screen.getByRole("button", { name: "Submit" });
    await user.click(confirmButton);

    // API should be called with undefined remarks (empty/whitespace only)
    await waitFor(() => {
      expect(fieldDefinitionsApi.submitVersion).toHaveBeenCalledWith(mockVersionId, {
        remarks: undefined,
      });
    });
  });

  it("submits with remarks when remarks are provided", async () => {
    const user = userEvent.setup();
    const testRemarks = "Please review this field definition carefully.";
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await act(async () => {
      await user.click(submitButton);
    });

    // Enter remarks
    const textArea = await screen.findByPlaceholderText(/add any notes for the reviewer/i);
    await act(async () => {
      await user.type(textArea, testRemarks);
    });

    // Click confirm
    const confirmButton = screen.getByRole("button", { name: "Submit" });
    await act(async () => {
      await user.click(confirmButton);
    });

    // API should be called with remarks
    await waitFor(() => {
      expect(fieldDefinitionsApi.submitVersion).toHaveBeenCalledWith(mockVersionId, {
        remarks: testRemarks,
      });
    });
  });

  it("trims whitespace from remarks before submitting", async () => {
    const user = userEvent.setup();
    const testRemarks = "  Remarks with spaces  ";
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Enter remarks with extra spaces
    await waitFor(() => {
      const textArea = screen.getByPlaceholderText(/add any notes for the reviewer/i);
      return textArea;
    });

    const textArea = screen.getByPlaceholderText(/add any notes for the reviewer/i);
    await user.type(textArea, testRemarks);

    // Click confirm
    const confirmButton = screen.getByRole("button", { name: "Submit" });
    await user.click(confirmButton);

    // API should be called with trimmed remarks
    await waitFor(() => {
      expect(fieldDefinitionsApi.submitVersion).toHaveBeenCalledWith(mockVersionId, {
        remarks: "Remarks with spaces",
      });
    });
  });

  it("closes modal when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText("Submit Field Version for Approval")).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    // Modal should disappear or be hidden (allow portal to update)
    await waitFor(
      () => {
        const dialog = screen.queryByRole("dialog");
        // Accept either removal from the DOM, being visually hidden (client rects collapsed),
        // or an in-flight 'leave' animation applied by AntD (classes like 'ant-zoom-leave').
        expect(
          dialog === null ||
            (dialog && dialog.getClientRects().length === 0) ||
            (dialog && /ant-zoom-leave/.test(dialog.className || ""))
        ).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it("clears remarks after cancellation", async () => {
    const user = userEvent.setup();
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Enter remarks
    await waitFor(() => {
      const textArea = screen.getByPlaceholderText(/add any notes for the reviewer/i);
      return textArea;
    });

    const textArea = screen.getByPlaceholderText(/add any notes for the reviewer/i);
    await user.type(textArea, "Test remarks");

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    // Open modal again
    await user.click(submitButton);

    // Remarks should be cleared
    await waitFor(() => {
      const textArea = screen.getByPlaceholderText(
        /add any notes for the reviewer/i
      ) as HTMLTextAreaElement;
      expect(textArea.value).toBe("");
    });
  });

  it("shows button in loading state while submitting", async () => {
    const user = userEvent.setup();
    // Mock API to never resolve (stays in loading state)
    vi.mocked(fieldDefinitionsApi.submitVersion).mockImplementation(() => new Promise(() => {}));

    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Click confirm
    await waitFor(() => {
      const confirmButton = screen.getByRole("button", { name: "Submit" });
      return confirmButton;
    });

    const confirmButton = screen.getByRole("button", { name: "Submit" });
    await user.click(confirmButton);

    // Button should show loading state
    await waitFor(() => {
      expect(confirmButton).toHaveClass("ant-btn-loading");
    });
  });

  it("handles API errors gracefully", async () => {
    const user = userEvent.setup();
    const errorMessage = "Failed to submit for approval";
    vi.mocked(fieldDefinitionsApi.submitVersion).mockRejectedValue(new Error(errorMessage));

    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Click confirm
    await waitFor(() => {
      const confirmButton = screen.getByRole("button", { name: "Submit" });
      return confirmButton;
    });

    const confirmButton = screen.getByRole("button", { name: "Submit" });
    await user.click(confirmButton);

    // Error should be handled (notification would be shown)
    await waitFor(() => {
      expect(fieldDefinitionsApi.submitVersion).toHaveBeenCalled();
    });
  });

  it("shows remarks character count", async () => {
    const user = userEvent.setup();
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Check for character count
    await waitFor(() => {
      expect(screen.getByText(/0 \/ 500/i)).toBeInTheDocument();
    });
  });

  it("enforces max length on remarks", async () => {
    const user = userEvent.setup();
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Get text area
    await waitFor(() => {
      const textArea = screen.getByPlaceholderText(/add any notes for the reviewer/i);
      return textArea;
    });

    const textArea = screen.getByPlaceholderText(/add any notes for the reviewer/i);

    // Check maxLength attribute
    expect(textArea).toHaveAttribute("maxlength", "500");
  });

  it("renders without fieldKey prop", () => {
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    expect(screen.getByRole("button", { name: /submit for approval/i })).toBeInTheDocument();
  });

  it("shows modal warning message about locking", async () => {
    const user = userEvent.setup();
    render(<SubmitApprovalButton versionId={mockVersionId} />);

    // Click the submit button
    const submitButton = screen.getByRole("button", {
      name: /submit for approval/i,
    });
    await user.click(submitButton);

    // Check for warning message
    await waitFor(() => {
      expect(screen.getByText(/once submitted, the version will be locked/i)).toBeInTheDocument();
    });
  });
});
