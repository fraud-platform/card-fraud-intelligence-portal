/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import React from "react";
import * as antd from "antd";

// Compatibility shim: map the legacy `bordered` prop to the new `variant` prop
// to avoid deprecation warnings while dependent libraries (or older code)
// still pass `bordered`. This ensures a smooth migration path.

function isCardType(type: unknown): boolean {
  if (type == null) {
    return false;
  }
  if (type === (antd as { Card?: { displayName?: string; name?: string } }).Card) {
    return true;
  }
  if (typeof type === "object") {
    const displayName = (type as { displayName?: string }).displayName;
    const name = (type as { name?: string }).name;
    return displayName === "Card" || name === "Card";
  }
  return false;
}

// Wrap React.createElement so we can detect when an Ant Design Card is being
// instantiated and map the legacy `bordered` prop to the new `variant` prop.
const OriginalCreateElement = React.createElement;
React.createElement = function (
  type: any,
  props?: any,
  ...children: any[]
): ReturnType<typeof React.createElement> {
  if (isCardType(type) && props != null) {
    const { bordered, variant, ...rest } = props;
    const finalProps: Record<string, unknown> = rest;
    if (variant === undefined && bordered !== undefined) {
      if (bordered === true) finalProps.variant = "outlined";
      // if bordered is false we do not set variant and omit bordered
    } else if (variant !== undefined) {
      finalProps.variant = variant;
    }
    return OriginalCreateElement(type, finalProps, ...children) as ReturnType<
      typeof React.createElement
    >;
  }

  return OriginalCreateElement(type, props, ...children) as ReturnType<typeof React.createElement>;
} as typeof React.createElement;

export const antdCardCompatApplied = true;
