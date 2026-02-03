import { ReactElement, ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { ConfigProvider, App as AntdApp } from "antd";
import {
  Refine,
  DataProvider,
  AuthProvider,
  AccessControlProvider,
  NotificationProvider,
} from "@refinedev/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Test Utilities for React Testing Library
 *
 * Provides custom render functions that wrap components with necessary providers
 * for Refine, React Router, and Ant Design. This ensures consistent test setup
 * across all component tests.
 */

/**
 * Ant Design theme configuration for tests
 * Matches the production theme configuration
 */
const antdConfig = {
  theme: {
    token: {
      colorPrimary: "#1890ff",
      borderRadius: 4,
      fontSize: 14,
    },
  },
};

/**
 * Default mock data provider for tests
 */
const defaultMockDataProvider: DataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: {} }),
  getMany: () => Promise.resolve({ data: [] }),
  create: () => Promise.resolve({ data: {} }),
  update: () => Promise.resolve({ data: {} }),
  deleteOne: () => Promise.resolve({ data: {} }),
  getApiUrl: () => "http://localhost:8000",
  custom: () => Promise.resolve({ data: {} }),
};

// Default data provider for tests. Use the mock data provider by default for faster tests.
// Integration tests can opt into MSW by setting dataProvider: realDataProvider
const defaultDataProvider: DataProvider = defaultMockDataProvider;

/**
 * Default mock auth provider for tests
 */
const defaultMockAuthProvider: AuthProvider = {
  login: () => Promise.resolve({ success: true }),
  logout: () => Promise.resolve({ success: true }),
  check: () => Promise.resolve({ authenticated: true }),
  getPermissions: () => Promise.resolve(["RULE_MAKER"] as any),
  getIdentity: () => Promise.resolve({ user_id: "test-user", roles: ["RULE_MAKER"] }),
  onError: () => Promise.resolve({}),
};

/**
 * Default mock access control provider for tests
 */
const defaultMockAccessControlProvider: AccessControlProvider = {
  can: () => Promise.resolve({ can: true }),
};

/**
 * Default mock notification provider for tests
 */
const defaultMockNotificationProvider: NotificationProvider = {
  open: () => {},
  close: () => {},
};

/**
 * Interface for custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  /**
   * Initial route for React Router
   * @default '/'
   */
  initialRoute?: string;

  /**
   * Custom Ant Design config provider props
   */
  antdConfig?: Parameters<typeof ConfigProvider>[0];

  /**
   * Custom data provider for Refine
   */
  dataProvider?: DataProvider;

  /**
   * Custom auth provider for Refine
   */
  authProvider?: AuthProvider;

  /**
   * Custom access control provider for Refine
   */
  accessControlProvider?: AccessControlProvider;

  /**
   * Custom notification provider for Refine
   */
  notificationProvider?: NotificationProvider;

  /**
   * Additional wrapper components
   */
  wrapper?: ({ children }: { children: ReactNode }) => ReactElement;
}

/**
 * All Providers Wrapper
 *
 * Wraps components with all necessary providers for testing:
 * - BrowserRouter for routing
 * - Ant Design ConfigProvider for theming
 * - Refine providers are included by the App component itself
 */
interface AllProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  antdConfig?: Parameters<typeof ConfigProvider>[0];
  dataProvider?: DataProvider;
  authProvider?: AuthProvider;
  accessControlProvider?: AccessControlProvider;
  notificationProvider?: NotificationProvider;
}

function AllProviders({
  children,
  initialRoute = "/",
  antdConfig: customAntdConfig,
  dataProvider = defaultMockDataProvider,
  authProvider = defaultMockAuthProvider,
  accessControlProvider = defaultMockAccessControlProvider,
  notificationProvider = defaultMockNotificationProvider,
}: AllProvidersProps): ReactElement {
  // Set initial route if provided
  if (initialRoute !== "/") {
    globalThis.history.pushState({}, "Test page", initialRoute);
  }

  // Create a new QueryClient for each test to avoid state leakage
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider {...(customAntdConfig || antdConfig)}>
          <AntdApp>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              notificationProvider={notificationProvider}
              resources={[
                { name: "rule-fields" },
                { name: "rules" },
                { name: "rulesets" },
                { name: "approvals" },
                { name: "audit-logs" },
              ]}
              options={{ disableTelemetry: true }}
            >
              {children}
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

/**
 * Custom render function that wraps components with all providers
 *
 * @example
 * ```tsx
 * import { customRender } from '@/test/utils';
 * import { MyComponent } from './MyComponent';
 *
 * describe('MyComponent', () => {
 *   it('renders correctly', () => {
 *     const { getByText } = customRender(<MyComponent />);
 *     expect(getByText('Hello')).toBeInTheDocument();
 *   });
 * });
 * ```
 *
 * @param ui - React element to render
 * @param options - Custom render options
 * @returns Render result with all RTL utilities
 */
export function customRender(ui: ReactElement, options?: CustomRenderOptions): RenderResult {
  const {
    initialRoute = "/",
    antdConfig: customAntdConfig,
    dataProvider,
    authProvider,
    accessControlProvider,
    notificationProvider,
    wrapper,
    ...renderOptions
  } = options || {};

  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    const content = (
      <AllProviders
        initialRoute={initialRoute}
        antdConfig={customAntdConfig}
        dataProvider={dataProvider ?? defaultDataProvider}
        authProvider={authProvider}
        accessControlProvider={accessControlProvider}
        notificationProvider={notificationProvider}
      >
        {children}
      </AllProviders>
    );

    // Apply custom wrapper if provided
    if (wrapper) {
      return wrapper({ children: content });
    }

    return content;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Re-export everything from React Testing Library
 * This allows importing from a single location: @/test/utils
 */
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

/**
 * Custom render is the default export for convenience
 */
export { customRender as render };

/**
 * Helper function to wait for async operations
 *
 * @example
 * ```tsx
 * await waitFor(() => {
 *   expect(screen.getByText('Loaded')).toBeInTheDocument();
 * });
 * ```
 */
export { waitFor } from "@testing-library/react";

/**
 * Helper function to create mock navigation
 */
export const createMockNavigate = (): ReturnType<typeof vi.fn> => {
  return vi.fn();
};

/**
 * Helper function to create mock location
 */
export const createMockLocation = (
  pathname = "/",
  search = "",
  hash = ""
): { pathname: string; search: string; hash: string; state: null; key: string } => ({
  pathname,
  search,
  hash,
  state: null,
  key: "default",
});

/**
 * Helper to wait for elements to appear/disappear
 */
export const waitForElementToBeRemoved = async (
  callback: () => HTMLElement | null
): Promise<void> => {
  const { waitForElementToBeRemoved: rtlWaitForElementToBeRemoved } =
    await import("@testing-library/react");
  return rtlWaitForElementToBeRemoved(callback);
};

// Type augmentation for vitest
import { vi } from "vitest";

declare global {
  const vi: (typeof import("vitest"))["vi"];
}
