import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@/test/utils";
import { Select } from "antd";

describe("MockSelect (multi-select)", () => {
  it("renders as multiple and accepts an initial selection", async () => {
    const Test = () => {
      const [value, setValue] = useState<string[]>([]);
      return (
        <Select
          data-testid="multi-select"
          mode="multiple"
          placeholder="Pick many"
          options={[
            { value: "v1", label: "Option One" },
            { value: "v2", label: "Option Two" },
            { value: "v3", label: "Option Three" },
          ]}
          value={value}
          onChange={setValue}
        />
      );
    };

    render(<Test />);

    // For multi-select the placeholder may not be rendered; ensure element exists and is multiple
    const sel = screen.getByTestId("multi-select") as HTMLSelectElement;
    expect(sel).toBeInTheDocument();
    expect(sel.multiple).toBe(true);

    sel.options[0].selected = true;
    fireEvent.change(sel);

    await waitFor(() =>
      expect(Array.from(sel.selectedOptions).map((o) => o.value)).toEqual(["v1"])
    );
  });
});
