import React, { useState } from "react";
import { render, screen, userEvent, within } from "@/test/utils";
import { Select } from "antd";

describe("MockSelect (test helper)", () => {
  it("shows placeholder, opens overlay, and selects an option", async () => {
    const Test = () => {
      const [value, setValue] = useState("");
      return (
        <Select
          data-testid="test-select"
          placeholder="Pick one"
          options={[
            { value: "auth0|supervisor1", label: "Sarah Manager (sarah.manager@company.com)" },
            { value: "auth0|supervisor2", label: "Mike Director (mike.director@company.com)" },
          ]}
          value={value}
          onChange={setValue}
        />
      );
    };

    render(<Test />);

    // Placeholder should be visible
    expect(screen.getByText("Pick one")).toBeInTheDocument();

    const select = screen.getByTestId("test-select");

    // Open overlay
    await userEvent.click(select);
    const overlay = await screen.findByTestId("test-select-overlay");
    expect(overlay).toBeInTheDocument();

    // Option should be visible in overlay and selectable
    const option = within(overlay).getByText(/Sarah Manager/);
    await userEvent.click(option);

    // Native select should now have the chosen value
    const sel = screen.getByTestId("test-select") as HTMLSelectElement;
    expect(sel.value).toBe("auth0|supervisor1");

    // Placeholder should no longer be visible
    expect(screen.queryByText("Pick one")).toBeNull();
  });
});
