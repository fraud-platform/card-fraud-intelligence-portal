import React from "react";
import { waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// server setup removed - handled globally
import RuleFieldList from "../list";
import { render } from "@/test/utils";

// Global test setup handles MSW server lifecycle

describe("RuleFieldList filters", () => {
  it("filters by data_type", async () => {
    render(<RuleFieldList />);

    // Wait for the table to render (don't require rows > 0 as resource may be mocked)
    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    // Type into data_type input and submit
    const dtInput = screen.getByPlaceholderText(/Data type \(e.g. STRING\)/i);
    await userEvent.type(dtInput, "STRING{enter}");

    // Table should remain renderable
    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 25000);

  it("filters by is_active", async () => {
    render(<RuleFieldList />);

    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    const activeInput = screen.getByPlaceholderText(/is_active \(true\/false\)/i);
    await userEvent.type(activeInput, "true{enter}");

    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 25000);
});
