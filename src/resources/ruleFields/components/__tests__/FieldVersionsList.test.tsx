/**
 * Tests for FieldVersionsList component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { FieldVersionsList } from "../FieldVersionsList";
import { fieldDefinitionsApi } from "@/api/fieldDefinitions";
import type { FieldVersion } from "@/types/fieldDefinitions";

// Mock the API
vi.mock("@/api/fieldDefinitions", () => ({
  fieldDefinitionsApi: {
    getVersions: vi.fn(),
  },
}));

// Mock useGo from Refine
vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...actual,
    useGo: vi.fn(() => vi.fn()),
  };
});

describe("FieldVersionsList", () => {
  const mockFieldKey = "test_field";
  const mockVersions: FieldVersion[] = [
    {
      rule_field_version_id: "version-1",
      field_key: mockFieldKey,
      version: 1,
      field_id: 100,
      display_name: "Test Field v1",
      description: "First version",
      data_type: "STRING",
      allowed_operators: ["EQ", "IN"],
      multi_value_allowed: false,
      is_sensitive: false,
      status: "DRAFT",
      created_by: "user1",
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      rule_field_version_id: "version-2",
      field_key: mockFieldKey,
      version: 2,
      field_id: 100,
      display_name: "Test Field v2",
      description: "Second version",
      data_type: "STRING",
      allowed_operators: ["EQ", "IN", "LIKE"],
      multi_value_allowed: true,
      is_sensitive: false,
      status: "APPROVED",
      created_by: "user2",
      created_at: "2024-01-16T10:00:00Z",
      approved_by: "checker1",
      approved_at: "2024-01-16T11:00:00Z",
    },
    {
      rule_field_version_id: "version-3",
      field_key: mockFieldKey,
      version: 3,
      field_id: 100,
      display_name: "Test Field v3",
      description: "Third version pending approval",
      data_type: "STRING",
      allowed_operators: ["EQ", "IN"],
      multi_value_allowed: false,
      is_sensitive: false,
      status: "PENDING_APPROVAL",
      created_by: "user1",
      created_at: "2024-01-17T10:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    vi.mocked(fieldDefinitionsApi.getVersions).mockResolvedValue(mockVersions);
  });

  it("renders table with version data", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    // Wait for the table to load
    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // Check that versions are displayed
    await waitFor(() => {
      expect(screen.getByText("Test Field v1")).toBeInTheDocument();
      expect(screen.getByText("Test Field v2")).toBeInTheDocument();
      expect(screen.getByText("Test Field v3")).toBeInTheDocument();
    });
  });

  it("shows status badges correctly", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // Check for status badges
    await waitFor(() => {
      expect(screen.getByText("Draft")).toBeInTheDocument();
      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    });
  });

  it("shows Edit button for DRAFT versions", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // Look for Edit button - should appear for DRAFT status
    await waitFor(() => {
      const editButtons = screen.getAllByText("Edit");
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  it("shows View button for non-DRAFT versions", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // All versions should have View button
    await waitFor(() => {
      const viewButtons = screen.getAllByText("View");
      // Should have View button for each version
      expect(viewButtons.length).toBe(3);
    });
  });

  it("shows data type tags", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // Check for data type tags
    await waitFor(() => {
      const dataTypeTags = screen.getAllByText("STRING");
      expect(dataTypeTags.length).toBeGreaterThan(0);
    });
  });

  it("displays version numbers correctly", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // Check for version numbers
    await waitFor(() => {
      expect(screen.getByText("v1")).toBeInTheDocument();
      expect(screen.getByText("v2")).toBeInTheDocument();
      expect(screen.getByText("v3")).toBeInTheDocument();
    });
  });

  it("displays created by information", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // Check for created by information (allow duplicates)
    await waitFor(() => {
      expect(screen.getAllByText("user1").length).toBeGreaterThan(0);
      expect(screen.getByText("user2")).toBeInTheDocument();
    });
  });

  it("displays formatted dates", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // Dates should be formatted - check that some date is displayed
    await waitFor(() => {
      const dates = screen.queryAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  it("shows loading state while fetching", () => {
    // Mock API to not resolve immediately
    vi.mocked(fieldDefinitionsApi.getVersions).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { container } = render(<FieldVersionsList fieldKey={mockFieldKey} />);

    // Check for loading spinner
    const spinElement = container.querySelector(".ant-spin");
    expect(spinElement).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    // Mock API error
    vi.mocked(fieldDefinitionsApi.getVersions).mockRejectedValue(new Error("Failed to fetch"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch field versions:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("calls API with correct field key", async () => {
    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(fieldDefinitionsApi.getVersions).toHaveBeenCalledWith(mockFieldKey);
    });
  });

  it("renders empty table when no versions", async () => {
    vi.mocked(fieldDefinitionsApi.getVersions).mockResolvedValue([]);

    render(<FieldVersionsList fieldKey={mockFieldKey} />);

    await waitFor(() => {
      expect(screen.getByText("Version History")).toBeInTheDocument();
    });

    // Table should still be present but empty
    await waitFor(() => {
      const table = document.querySelector(".ant-table");
      expect(table).toBeInTheDocument();
    });
  });
});
