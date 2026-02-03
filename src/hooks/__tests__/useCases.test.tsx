import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react";
import React from "react";

vi.mock("../../api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

import { get, post } from "../../api/httpClient";
import { useCasesList, useCase, useCreateCase } from "../useCases";

function CasesListTest() {
  const { cases, total, isLoading } = useCasesList({});
  return (
    <div>
      <div>loading:{String(isLoading)}</div>
      <div>total:{total}</div>
      <ul>
        {cases.map((c) => (
          <li key={c.id}>{c.case_number}</li>
        ))}
      </ul>
    </div>
  );
}

function CaseTest({ caseId }: { caseId: string }) {
  const { case_, isLoading } = useCase({ caseId });
  return (
    <div>
      <div>loading:{String(isLoading)}</div>
      <div>case:{case_ ? case_.id : ""}</div>
      <button
        id="do-update"
        onClick={() => {
          /* noop for test */
        }}
      ></button>
    </div>
  );
}

function CreateCaseTest() {
  const { createCase, isCreating } = useCreateCase();
  return (
    <div>
      <div>creating:{String(isCreating)}</div>
      <button
        onClick={async () => {
          const c = await createCase({ title: "new" } as any);
          const el = document.getElementById("created");
          if (el) el.textContent = c ? c.id : "";
        }}
      >
        create
      </button>
      <div id="created" />
    </div>
  );
}

describe("useCases family", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches cases list and renders items", async () => {
    (get as unknown as any).mockResolvedValueOnce({
      items: [{ id: "c1", case_number: "CASE-1" }],
      total: 1,
    });

    render(<CasesListTest />);

    await waitFor(() => expect(screen.getByText("CASE-1")).toBeInTheDocument());
    expect(screen.getByText("total:1")).toBeInTheDocument();
  });

  it("fetches a single case", async () => {
    (get as unknown as any).mockResolvedValueOnce({ id: "case-1" });

    render(<CaseTest caseId="case-1" />);

    await waitFor(() => expect(screen.getByText("case:case-1")).toBeInTheDocument());
  });

  it("createCase posts and returns created case", async () => {
    (post as unknown as any).mockResolvedValueOnce({ id: "new-case" });

    render(<CreateCaseTest />);

    const btn = screen.getByText("create");
    await act(async () => {
      btn.click();
    });

    await waitFor(() => expect(document.getElementById("created")?.textContent).toBe("new-case"));
    expect(post).toHaveBeenCalled();
  });
});
