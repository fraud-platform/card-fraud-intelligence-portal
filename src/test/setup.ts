import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { server } from "./server";

const mswEnabled = process.env.VITEST_MSW === "false" ? false : true;
const strictMswUnhandledRequests = process.env.VITEST_STRICT_MSW === "true" ? true : false;
const mswUnhandledRequestMode = strictMswUnhandledRequests ? "warn" : "bypass";
let hasRuntimeMswOverrides = false;

if (mswEnabled) {
  const originalServerUse = server.use.bind(server) as typeof server.use;
  server.use = ((...handlers: Parameters<typeof server.use>) => {
    hasRuntimeMswOverrides = true;
    return originalServerUse(...handlers);
  }) as typeof server.use;

  // Start server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: mswUnhandledRequestMode }));

  //  Close server after all tests
  afterAll(() => server.close());
}

// Reset handlers after each test only when runtime overrides are used
afterEach(() => {
  if (mswEnabled && hasRuntimeMswOverrides) {
    server.resetHandlers();
    hasRuntimeMswOverrides = false;
  }
  cleanup();
});

/**
 * Test Setup File - Performance Optimized
 *
 * Uses minimal mocks for @refinedev packages
 * Only mocks specific components that cause issues in tests
 */

// ============================================================
// BROWSER API MOCKS
// ============================================================

const createMockMediaQueryList = (query: string): MediaQueryList =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  }) as unknown as MediaQueryList;

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => createMockMediaQueryList(query))
);

class IntersectionObserverMock {
  constructor(public callback?: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
  root: Element | Document | null = null;
  rootMargin = "0px";
  thresholds: ReadonlyArray<number> = [0];
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

class ResizeObserverMock {
  constructor(public callback?: ResizeObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

Element.prototype.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

// ============================================================
// ANTD UTILITIES
// ============================================================

vi.mock("antd/lib/_util/responsiveObserver", () => ({
  default: {
    subscribe: vi.fn((cb: (obj: Record<string, boolean>) => void) => {
      cb({ xs: true, sm: true, md: true, lg: true, xl: true, xxl: true });
      return 1;
    }),
    unsubscribe: vi.fn(),
    register: vi.fn(() => ({ xs: true, sm: true, md: true, lg: true, xl: true, xxl: true })),
    unregister: vi.fn(),
    dispatchEvent: vi.fn(),
  },
}));

vi.mock("antd/lib/grid/hooks/useBreakpoint", () => ({
  default: vi.fn(() => ({ xs: true, sm: true, md: true, lg: true, xl: true, xxl: true })),
}));

// Global lightweight Select mock for stable testing environments
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  const React = await vi.importActual("react");

  const MockSelect = ({ children, value, onChange, ...rest }: any) => {
    // Remove common AntD-only props and normalize value for native select
    const {
      options: optionsProp,
      allowClear: _allowClear,
      maxTagCount: _maxTagCount,
      maxTagPlaceholder: _maxTagPlaceholder,
      mode: _mode,
      showSearch: _showSearch,
      optionFilterProp: _optionFilterProp,
      ...domProps
    } = rest;

    // Support both children-based and `options`-based usage that AntD supports.
    const optionsFromProp = Array.isArray(optionsProp) ? optionsProp : null;

    // Extract a uniform array of { value, label } items regardless of whether
    // AntD was used via `options` prop or `Select.Option` children.
    const normalizedOptions: Array<{ value: any; label: string; title?: string; desc?: string }> =
      optionsFromProp
        ? optionsFromProp.map((opt: any) => ({
            value: opt.value ?? opt,
            label: String(opt.label ?? opt.value ?? String(opt)),
            title: String(opt.label ?? opt.value ?? String(opt)),
            desc: "",
          }))
        : React.Children.toArray(children)
            .filter(Boolean)
            .map((child: any) => {
              const extractText = (node: any): string => {
                if (node == null) return "";
                if (typeof node === "string" || typeof node === "number") return String(node);
                if (Array.isArray(node)) return node.map(extractText).join(" ");
                if (React.isValidElement(node)) return extractText(node.props?.children);
                return "";
              };

              const childrenNodes = child.props?.children;
              let title = "";
              let desc = "";

              if (child.props?.label) {
                title = String(child.props.label);
              } else if (Array.isArray(childrenNodes)) {
                title = extractText(childrenNodes[0]);
                desc = childrenNodes.slice(1).map(extractText).join(" ").trim();
              } else if (React.isValidElement(childrenNodes)) {
                const grand = childrenNodes.props?.children;
                if (Array.isArray(grand)) {
                  title = extractText(grand[0]);
                  desc = grand.slice(1).map(extractText).join(" ").trim();
                } else {
                  title = extractText(childrenNodes);
                }
              } else {
                title = extractText(childrenNodes) || String(child.props?.value ?? "");
              }

              const combined = desc ? `${title} ${desc}` : title;
              return { value: child.props.value, label: combined, title, desc };
            });

    // Determine if this should behave like a multiple select
    const isMultiple = Boolean(
      domProps.multiple || _mode === "multiple" || _mode === "tags" || Array.isArray(value)
    );

    const normalizedValue = isMultiple
      ? Array.isArray(value)
        ? value
        : value == null
          ? []
          : [value]
      : value == null
        ? ""
        : value;

    // Manage an internal 'open' state to mimic AntD's overlay dropdown so tests
    // that rely on finding option text after `mouseDown` behave similarly.
    const [open, setOpen] = React.useState(false);

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "select",
        {
          ...domProps,
          role: domProps.role ?? "combobox",
          "aria-expanded": !!open,
          multiple: isMultiple || undefined,
          value: normalizedValue,
          onChange: (e: any) => {
            if (isMultiple) {
              const vals = Array.from(e.target.selectedOptions).map((o: any) => o.value);
              onChange?.(vals);
            } else {
              onChange?.(e.target.value);
            }
          },
          id: domProps.id ?? domProps.name,
          name: domProps.name,
          "data-testid": domProps["data-testid"] ?? "mock-select",
          onMouseDown: () => setOpen(true),
        },
        normalizedOptions.map((opt, i) =>
          React.createElement(
            "option",
            { key: opt.value ?? i, value: opt.value ?? opt.label },
            String(opt.value ?? "")
          )
        )
      ),
      !isMultiple &&
        (normalizedValue === "" || normalizedValue == null) &&
        domProps.placeholder &&
        React.createElement("span", { className: "mock-select-placeholder" }, domProps.placeholder),
      open &&
        React.createElement(
          "div",
          {
            role: "listbox",
            "data-testid": domProps["data-testid"]
              ? `${domProps["data-testid"]}-overlay`
              : "mock-select-overlay",
          },
          normalizedOptions.map((opt) =>
            React.createElement(
              "div",
              {
                role: "option",
                key: opt.value,
                "data-value": opt.value,
                onClick: () => {
                  if (isMultiple) {
                    const next = Array.isArray(normalizedValue) ? normalizedValue.slice() : [];
                    const idx = next.indexOf(opt.value);
                    if (idx === -1) next.push(opt.value);
                    else next.splice(idx, 1);

                    // Synchronously update underlying native <select> options to reflect
                    // the new selection immediately for tests that inspect selectedOptions.
                    const sel = document.querySelector(
                      `select[data-testid="${domProps["data-testid"] ?? "mock-select"}"]`
                    ) as HTMLSelectElement | null;
                    if (sel) {
                      const opts = Array.from(sel.options) as HTMLOptionElement[];
                      opts.forEach((o) => {
                        o.selected = next.includes(o.value);
                      });
                    }

                    onChange?.(next);
                  } else {
                    onChange?.(opt.value);
                    setOpen(false);
                  }
                },
              },
              React.createElement(
                "span",
                { key: "title", className: "mock-select-label" },
                opt.title ?? opt.label
              ),
              opt.desc &&
                React.createElement(
                  "span",
                  { key: "desc", className: "mock-select-desc" },
                  opt.desc
                )
            )
          )
        )
    );
  };

  const MockOption = (props: any) =>
    React.createElement("option", { value: props.value }, String(props.value ?? ""));
  MockSelect.Option = MockOption;

  return {
    ...actual,
    Select: MockSelect,
    Option: MockOption,
  };
});

// ============================================================
// DISABLE MOTION / ANIMATIONS IN TESTS
// ============================================================

// Many Ant Design and rc-* libraries use CSS/JS motion. In tests these
// animations trigger asynchronous updates that surface as "act(...)"
// warnings. Replace motion components with synchronous no-op variants to
// render children immediately and remove flakiness.
import _React from "react";
vi.mock("rc-motion", () => {
  const NoMotion = ({ children }: any) => children ?? null;
  return {
    __esModule: true,
    default: NoMotion,
    CSSMotion: NoMotion,
    DomWrapper: ({ children }: any) => children ?? null,
  };
});

// Replace CreateButton from @refinedev/antd with a safe local component to
// prevent `replace` prop leakage to native anchors causing DOM warnings in tests.
vi.mock("@refinedev/antd", async () => {
  const actual = await vi.importActual("@refinedev/antd");
  const React = await vi.importActual("react");

  const SafeCreateButton = ({ children, ...props }: any) => {
    // Drop any `replace` prop and render a simple button for tests
    const { replace: _r, ...rest } = props;
    return React.createElement("button", rest, children);
  };

  return {
    ...actual,
    CreateButton: SafeCreateButton,
  };
});

// ============================================================
// CONSOLE FILTERING
// ============================================================

const suppressConsoleNoise = process.env.VITEST_SUPPRESS_NOISE === "false" ? false : true;
const suppressedConsolePatterns = [
  /Not implemented: Window's getComputedStyle\(\) method/i,
  /not wrapped in act\(\.\.\.\)/i,
  /current testing environment is not configured to support act/i,
  /Received `false` for a non-boolean attribute `replace`/i,
  /`value` prop on `select` should not be null/i,
  /does not recognize the `allowClear` prop/i,
  /does not recognize the `suffixIcon` prop/i,
];

const toConsoleMessage = (args: unknown[]): string =>
  args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
      if (arg && typeof arg === "object" && "message" in arg) {
        const candidate = (arg as { message?: unknown }).message;
        if (typeof candidate === "string") {
          return candidate;
        }
      }
      return String(arg);
    })
    .join(" ");

if (suppressConsoleNoise) {
  const originalConsoleError = console.error.bind(console);
  const originalConsoleWarn = console.warn.bind(console);

  const shouldSuppress = (args: unknown[]): boolean => {
    const msg = toConsoleMessage(args);
    return suppressedConsolePatterns.some((pattern) => pattern.test(msg));
  };

  console.error = (...args: any[]) => {
    if (shouldSuppress(args)) {
      return;
    }
    return originalConsoleError(...args);
  };

  console.warn = (...args: any[]) => {
    if (shouldSuppress(args)) {
      return;
    }
    return originalConsoleWarn(...args);
  };
}

const originalGetComputedStyle = globalThis.getComputedStyle.bind(globalThis);
globalThis.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
  if (pseudoElt) {
    return { getPropertyValue: (_: string) => "" } as unknown as CSSStyleDeclaration;
  }
  return originalGetComputedStyle(elt);
};

// Card compatibility shim
import "../shared/compat/antdCardCompat";
// Compatibility shim: safe Link to prevent `replace` being forwarded
// to native <a> elements (avoids React's non-boolean attribute warnings).
import "../shared/compat/refineLinkCompat";

export const waitForLoadingToFinish = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};
