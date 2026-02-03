import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react";
import React from "react";

vi.mock("../../api/httpClient", () => ({
  post: vi.fn(),
}));

import { post } from "../../api/httpClient";
import { useBulkOperations } from "../useBulkOperations";

function TestComp() {
  const { bulkAssign, bulkUpdateStatus, bulkCreateCase } = useBulkOperations();
  const [assignResult, setAssignResult] = React.useState("");
  const [statusResult, setStatusResult] = React.useState("");
  const [createResult, setCreateResult] = React.useState("");

  return (
    <div>
      <button
        id="assign"
        onClick={async () => {
          const r = await bulkAssign({ items: ["a"] } as any);
          setAssignResult((r as any)?.status ?? "");
        }}
      >
        assign
      </button>
      <button
        id="status"
        onClick={async () => {
          const r = await bulkUpdateStatus({ items: ["a"] } as any);
          setStatusResult((r as any)?.status ?? "");
        }}
      >
        status
      </button>
      <button
        id="create"
        onClick={async () => {
          const r = await bulkCreateCase({ items: ["a"] } as any);
          setCreateResult((r as any)?.status ?? "");
        }}
      >
        create
      </button>
      <div data-testid="assignRes">{assignResult}</div>
      <div data-testid="statusRes">{statusResult}</div>
      <div data-testid="createRes">{createResult}</div>
    </div>
  );
}

describe("useBulkOperations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("bulkAssign calls POST and returns response", async () => {
    (post as unknown as any).mockResolvedValueOnce({ status: "ok" });
    const { getByTestId } = render(<TestComp />);

    await act(async () => {
      document.getElementById("assign")!.click();
    });
    await waitFor(() => expect(getByTestId("assignRes")).toHaveTextContent("ok"));
    expect(post).toHaveBeenCalled();
  });

  it("bulkUpdateStatus works", async () => {
    (post as unknown as any).mockResolvedValueOnce({ status: "updated" });
    const { getByTestId } = render(<TestComp />);

    await act(async () => {
      document.getElementById("status")!.click();
    });
    await waitFor(() => expect(getByTestId("statusRes")).toHaveTextContent("updated"));
  });

  it("bulkCreateCase works", async () => {
    (post as unknown as any).mockResolvedValueOnce({ status: "created" });
    const { getByTestId } = render(<TestComp />);

    await act(async () => {
      document.getElementById("create")!.click();
    });
    await waitFor(() => expect(getByTestId("createRes")).toHaveTextContent("created"));
  });
});
