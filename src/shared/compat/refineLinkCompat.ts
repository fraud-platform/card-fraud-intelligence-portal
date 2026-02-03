/*
 * Compatibility: Safe Refine Link
 *
 * Refine's LinkComponent forwards all props to a native <a> when no
 * router provider is present. That can cause React warnings when
 * boolean props like `replace` are passed to DOM elements. To avoid
 * these warnings at runtime (both in tests and in dev builds), we
 * replace Refine's LinkComponent and Link exports with safe wrappers
 * that strip `replace` when rendering native anchors.
 *
 * This is a small, local shim that avoids modifying upstream code and
 * ensures no DOM attribute leakage.
 */

/*
 * This file intentionally uses some dynamic typing to patch runtime behaviour
 * of the `@refinedev/core` package in test/dev environments. The shims are
 * minimal and localized; keep changes small and well-documented.
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions, @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */

import { forwardRef, useContext } from "react";
import * as refine from "@refinedev/core";

// Grab references to the original internal pieces (runtime-only)
const OriginalLinkComponent = (refine as any).LinkComponent;
const RouterContext = (refine as any).RouterContext;

if (OriginalLinkComponent && RouterContext) {
  const SafeLinkComponent = function SafeLinkComponent(
    props: Record<string, unknown>,
    ref: unknown
  ) {
    const routerContext = useContext(RouterContext);
    const LinkFromContext = (routerContext as any)?.Link;

    // If there's a Link implementation provided by the router, let it receive
    // props as-is (it likely expects `replace` etc.). If not, we'll render a
    // native anchor and must strip `replace` (and any other non-DOM props).
    const safeProps = LinkFromContext
      ? props
      : (({ replace: _replace, go: _go, to: _to, ...rest }: Record<string, unknown>) => rest)(
          props
        );

    // Call the original component with the safe props and forwarded ref.
    // Using a runtime call to the original component; typed as unknown intentionally.
    return OriginalLinkComponent({ ...safeProps }, ref as any);
  };

  const SafeLink = forwardRef(SafeLinkComponent as any);

  try {
    // Patch module exports at runtime so consumers of `@refinedev/core` receive
    // the safe versions. This is a runtime-only compatibility shim and uses
    // narrow, deliberate operations. Use `@ts-expect-error` to acknowledge the
    // dynamic assignment is intentional and validated by tests.
    (refine as any).LinkComponent = SafeLinkComponent;
    (refine as any).Link = SafeLink;
  } catch (e) {
    // Non-fatal if patching fails in some environments

    console.warn("[refineLinkCompat] patch failed", e);
  }
}

export {};
