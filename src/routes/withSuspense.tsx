import { Suspense, type ComponentType, type JSX } from "react";
import { RouteLoadingFallback } from "./components";

/**
 * Wrap a component with Suspense
 */
export function withSuspense<P extends object>(
  Component: ComponentType<P>
): (props: P) => JSX.Element {
  return function SuspenseWrapper(props: P): JSX.Element {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
