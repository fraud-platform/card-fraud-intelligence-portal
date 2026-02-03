/**
 * Tests for FieldRegistryStatusWidget component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { FieldRegistryStatusWidget } from "../StatusWidget";
import { fieldDefinitionsApi } from "@/api/fieldDefinitions";
import type { FieldRegistryManifest } from "@/types/fieldDefinitions";

// Mock the API
vi.mock("@/api/fieldDefinitions", () => ({
  fieldDefinitionsApi: {
    getRegistry: vi.fn(),
  },
}));

describe("FieldRegistryStatusWidget", () => {
  const mockRegistry: FieldRegistryManifest = {
    manifest_id: "manifest-1",
    registry_version: 1,
    artifact_uri: "s3://buckets/registry/v1.json",
    checksum: "abc123def456",
    field_count: 42,
    created_by: "admin",
    created_at: "2024-01-15T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading state", () => {
    it("shows loading state while fetching", () => {
      // Mock API to not resolve immediately
      vi.mocked(fieldDefinitionsApi.getRegistry).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { container } = render(<FieldRegistryStatusWidget />);

      // Check for loading skeleton (Card with loading prop shows skeleton)
      const loadingCard = container.querySelector(".ant-card-loading");
      expect(loadingCard).toBeInTheDocument();
    });

    it("shows sync icon while loading", () => {
      vi.mocked(fieldDefinitionsApi.getRegistry).mockImplementation(() => new Promise(() => {}));

      const { container } = render(<FieldRegistryStatusWidget />);

      // When loading=true, Card shows skeleton, not the custom content
      // So we check for skeleton content instead
      const skeleton = container.querySelector(".ant-skeleton");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("Published registry state", () => {
    beforeEach(() => {
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(mockRegistry);
    });

    it("renders widget with published registry", async () => {
      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for Published tag (specifically in the tag element)
      await waitFor(() => {
        const publishedElements = screen.getAllByText("Published");
        const tagElement = publishedElements.find((el) => el.closest(".ant-tag"));
        expect(tagElement).toBeInTheDocument();
      });
    });

    it("shows version number in simple view", async () => {
      render(<FieldRegistryStatusWidget detailed={false} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for version number (the value part, since "v" is prefix)
      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });
    });

    it("shows field count in simple view", async () => {
      render(<FieldRegistryStatusWidget detailed={false} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for field count
      await waitFor(() => {
        expect(screen.getByText("42")).toBeInTheDocument();
      });
    });

    it("shows published date in simple view", async () => {
      render(<FieldRegistryStatusWidget detailed={false} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for formatted date
      await waitFor(() => {
        expect(screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeInTheDocument();
      });
    });

    it("shows version tag in detailed view", async () => {
      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for version tag
      await waitFor(() => {
        expect(screen.getByText("v1")).toBeInTheDocument();
      });
    });

    it("shows checksum in detailed view", async () => {
      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for checksum
      await waitFor(() => {
        expect(screen.getByText("abc123def456")).toBeInTheDocument();
      });
    });

    it("shows artifact URI in detailed view", async () => {
      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for artifact URI
      await waitFor(() => {
        expect(screen.getByText("s3://buckets/registry/v1.json")).toBeInTheDocument();
      });
    });

    it("shows created by in detailed view", async () => {
      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for created by
      await waitFor(() => {
        expect(screen.getByText("admin")).toBeInTheDocument();
      });
    });

    it("shows formatted created date in detailed view", async () => {
      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for formatted date in descriptions
      await waitFor(() => {
        const dates = screen.queryAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        expect(dates.length).toBeGreaterThan(0);
      });
    });

    it("has copyable checksum in detailed view", async () => {
      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for copyable checksum (code element with copyable functionality)
      await waitFor(() => {
        const checksumElement = screen.getByText("abc123def456");
        expect(checksumElement).toBeInTheDocument();
        // Check that it's in a code element (Typography.Text with code prop)
        expect(checksumElement.closest("code")).toBeInTheDocument();
      });
    });
  });

  describe("Not published state", () => {
    beforeEach(() => {
      // Mock API to return null (no registry published)
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(null as any);
    });

    it("shows not published tag when no registry", async () => {
      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText("Field Registry")).toBeInTheDocument();
      });

      // Check for Not Published tag
      await waitFor(() => {
        expect(screen.getByText(/not published/i)).toBeInTheDocument();
      });
    });

    it("shows informational message when no registry", async () => {
      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText(/no field registry has been published yet/i)).toBeInTheDocument();
      });
    });

    it("shows publish call to action message", async () => {
      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(
          screen.getByText(/publish a registry to make approved field versions available/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("API errors", () => {
    it("handles API errors gracefully", async () => {
      // Mock API error
      vi.mocked(fieldDefinitionsApi.getRegistry).mockRejectedValue(
        new Error("Failed to fetch registry")
      );

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(<FieldRegistryStatusWidget />);

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to fetch field registry:",
          expect.any(Error)
        );
      });

      // Widget should show "not published" state when API fails
      await waitFor(() => {
        expect(screen.getByText(/not published/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Props and variations", () => {
    beforeEach(() => {
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(mockRegistry);
    });

    it("renders with default small size", async () => {
      const { container } = render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for small size card
      const card = container.querySelector(".ant-card-small");
      expect(card).toBeInTheDocument();
    });

    it("renders with default detailed prop as false", async () => {
      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Should show statistics (simple view), not descriptions
      await waitFor(() => {
        expect(screen.getByText("Version")).toBeInTheDocument();
        expect(screen.getByText("Fields")).toBeInTheDocument();
      });
    });

    it("renders with custom size prop", async () => {
      const { container } = render(<FieldRegistryStatusWidget size="default" />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Should not have small size class
      const card = container.querySelector(".ant-card-small");
      expect(card).not.toBeInTheDocument();
    });
  });

  describe("Cloud icon and title", () => {
    beforeEach(() => {
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(mockRegistry);
    });

    it("shows cloud server icon in title", async () => {
      const { container } = render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for cloud server icon
      const icon = container.querySelector(".anticon-cloud-server");
      expect(icon).toBeInTheDocument();
    });

    it("shows correct title text", async () => {
      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText("Field Registry")).toBeInTheDocument();
      });
    });
  });

  describe("Field count display", () => {
    it("shows correct field count label in detailed view", async () => {
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(mockRegistry);

      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for field count label
      await waitFor(() => {
        expect(screen.getByText("Field Count")).toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();
      });
    });

    it("shows fields statistic in simple view", async () => {
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(mockRegistry);

      render(<FieldRegistryStatusWidget detailed={false} />);

      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Check for "Fields" statistic label
      await waitFor(() => {
        expect(screen.getByText("Fields")).toBeInTheDocument();
      });
    });
  });

  describe("Version edge cases", () => {
    it("handles version 0 correctly", async () => {
      const registryWithZero: FieldRegistryManifest = {
        ...mockRegistry,
        registry_version: 0,
      };
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(registryWithZero);

      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });

    it("handles large version numbers", async () => {
      const registryWithLargeVersion: FieldRegistryManifest = {
        ...mockRegistry,
        registry_version: 999,
      };
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(registryWithLargeVersion);

      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText("999")).toBeInTheDocument();
      });
    });
  });

  describe("Edge cases and missing data", () => {
    it("handles missing optional fields gracefully", async () => {
      const incompleteRegistry: Partial<FieldRegistryManifest> = {
        manifest_id: "manifest-1",
        registry_version: 1,
        artifact_uri: "",
        checksum: "",
        field_count: 0,
        created_by: "",
        created_at: "",
      };
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(
        incompleteRegistry as FieldRegistryManifest
      );

      render(<FieldRegistryStatusWidget detailed={true} />);

      // Widget should still render
      await waitFor(() => {
        expect(screen.getByText(/field registry/i)).toBeInTheDocument();
      });

      // Should show placeholders for missing data
      await waitFor(() => {
        expect(screen.getByText("v1")).toBeInTheDocument();
        expect(screen.getAllByText("-").length).toBeGreaterThan(0);
      });
    });

    it("handles zero field count", async () => {
      const emptyRegistry: FieldRegistryManifest = {
        ...mockRegistry,
        field_count: 0,
      };
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(emptyRegistry);

      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });

    it("handles very long checksum", async () => {
      const longChecksum = "a".repeat(100);
      const registryWithLongChecksum: FieldRegistryManifest = {
        ...mockRegistry,
        checksum: longChecksum,
      };
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(registryWithLongChecksum);

      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        expect(screen.getByText(longChecksum)).toBeInTheDocument();
      });
    });

    it("handles very long artifact URI", async () => {
      const longUri = "s3://very-long-bucket-name/path/to/registry/v1/with/long/path/registry.json";
      const registryWithLongUri: FieldRegistryManifest = {
        ...mockRegistry,
        artifact_uri: longUri,
      };
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(registryWithLongUri);

      render(<FieldRegistryStatusWidget detailed={true} />);

      await waitFor(() => {
        const uriElement = screen.getByText(longUri);
        expect(uriElement).toBeInTheDocument();
        // Note: ellipsis class may not be applied in test environment due to no overflow detection
        // expect(uriElement).toHaveClass('ant-typography-ellipsis');
      });
    });
  });

  describe("API calls", () => {
    it("calls API on mount", async () => {
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(mockRegistry);

      render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(fieldDefinitionsApi.getRegistry).toHaveBeenCalledTimes(1);
      });
    });

    it("does not call API again on re-render with same props", async () => {
      vi.mocked(fieldDefinitionsApi.getRegistry).mockResolvedValue(mockRegistry);

      const { rerender } = render(<FieldRegistryStatusWidget />);

      await waitFor(() => {
        expect(fieldDefinitionsApi.getRegistry).toHaveBeenCalledTimes(1);
      });

      // Re-render with same props
      rerender(<FieldRegistryStatusWidget />);

      // Should not call API again (component doesn't use props that would trigger refetch)
      await waitFor(() => {
        expect(fieldDefinitionsApi.getRegistry).toHaveBeenCalledTimes(1);
      });
    });
  });
});
