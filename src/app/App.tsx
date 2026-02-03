/**
 * App Component
 *
 * Main application component with Refine configuration.
 * Sets up routing, authentication, data providers, and layout.
 *
 * Enterprise Modernization Features:
 * - ThemeProvider with density toggle and dark mode support
 * - CommandPalette for global navigation (Cmd+K)
 * - Algorithm-based theme configuration
 */

import type { JSX } from "react";
import { Refine, Authenticated } from "@refinedev/core";
import "../shared/styles/common.css";
import { ErrorComponent, useNotificationProvider } from "@refinedev/antd";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { App as AntdApp, ConfigProvider, Spin } from "antd";

// Ant Design styles
import "@refinedev/antd/dist/reset.css";

// Providers
import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";
import { accessControlProvider } from "./accessControlProvider";
import { resources } from "./routes";
import { usePermissions } from "../hooks/usePermissions";

// Theme System
import { ThemeProvider, useTheme } from "../theme";

// Modernization Components
import { CommandPalette } from "../components/command-palette";

// Layout Components
import { EnterpriseLayout } from "../shared/components/Layout";

// Pages
import { LoginPage } from "../pages/Login";
import { CallbackPage } from "../pages/Callback";

// Resource Components - Rule Fields
import { RuleFieldList } from "../resources/ruleFields/list";
import { RuleFieldCreate } from "../resources/ruleFields/create";
import { RuleFieldEdit } from "../resources/ruleFields/edit";

// Resource Components - Rules
import { RuleList } from "../resources/rules/list";
import { RuleCreate } from "../resources/rules/create";
import { RuleEdit } from "../resources/rules/edit";
import { RuleShow } from "../resources/rules/show";

// Resource Components - Rule Sets
import { RuleSetList } from "../resources/ruleSets/list";
import { RuleSetCreate } from "../resources/ruleSets/create";
import { RuleSetEdit } from "../resources/ruleSets/edit";
import { RuleSetShow } from "../resources/ruleSets/show";

// Resource Components - Approvals
import { ApprovalList } from "../resources/approvals/list";
import { ApprovalShow } from "../resources/approvals/show";

// Resource Components - Audit Logs
import { AuditLogList } from "../resources/auditLogs/list";
import { AuditLogShow } from "../resources/auditLogs/show";

// Resource Components - Worklist/Transactions/Cases
import WorklistList from "../resources/worklist/list";
import { TransactionList } from "../resources/transactions/list";
import { TransactionShow } from "../resources/transactions/show";
import { TransactionMetrics } from "../resources/transactions/metrics";
import CasesList from "../resources/cases/list";
import CasesShow from "../resources/cases/show";
import CasesCreate from "../resources/cases/create";

function DefaultRoute(): JSX.Element {
  const { capabilities, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="centered-container">
        <Spin size="large" />
      </div>
    );
  }

  if (capabilities.canReviewTransactions || capabilities.canViewTransactions) {
    return <CatchAllNavigate to="/worklist" />;
  }

  return <CatchAllNavigate to="/rule-fields" />;
}

/**
 * Main App Component
 */
function getCSPNonce(): string | undefined {
  try {
    // Prefer explicit global set by server
    const win =
      typeof window !== "undefined" ? (window as Window & { __CSP_NONCE__?: string }) : undefined;
    if (win != null && typeof win.__CSP_NONCE__ === "string") return win.__CSP_NONCE__;

    // Fallback to a meta tag that can be injected by the server per-request
    const meta =
      typeof document !== "undefined"
        ? document.querySelector<HTMLMetaElement>('meta[name="csp-nonce"]')
        : null;
    const content = meta?.getAttribute("content");
    if (typeof content === "string" && content.length > 0) {
      return content;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Inner App component that uses theme context
 */
function AppContent(): JSX.Element {
  const { themeConfig } = useTheme();
  const nonce = getCSPNonce();

  return (
    <ConfigProvider theme={themeConfig} csp={nonce !== undefined ? { nonce } : undefined}>
      <AntdApp>
        <Refine
          authProvider={authProvider}
          dataProvider={dataProvider}
          accessControlProvider={accessControlProvider}
          notificationProvider={useNotificationProvider}
          routerProvider={routerBindings}
          resources={resources}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: "fraud-intelligence-portal",
            disableTelemetry: true,
          }}
        >
          <Routes>
            {/* Auth0 Callback Route - must be publicly accessible */}
            <Route path="/callback" element={<CallbackPage />} />

            {/* Public Routes */}
            <Route
              element={
                <Authenticated
                  key="authenticated-outer"
                  fallback={<CatchAllNavigate to="/login" />}
                >
                  <EnterpriseLayout>
                    <Outlet />
                  </EnterpriseLayout>
                </Authenticated>
              }
            >
              {/* Default route - role-aware landing */}
              <Route index element={<DefaultRoute />} />

              {/* Rule Fields Routes */}
              <Route path="/rule-fields">
                <Route index element={<RuleFieldList />} />
                <Route path="create" element={<RuleFieldCreate />} />
                <Route path="edit/:id" element={<RuleFieldEdit />} />
              </Route>

              {/* Rules Routes */}
              <Route path="/rules">
                <Route index element={<RuleList />} />
                <Route path="create" element={<RuleCreate />} />
                <Route path="edit/:id" element={<RuleEdit />} />
                <Route path="show/:id" element={<RuleShow />} />
              </Route>

              {/* Rule Sets Routes */}
              <Route path="/rulesets">
                <Route index element={<RuleSetList />} />
                <Route path="create" element={<RuleSetCreate />} />
                <Route path="edit/:id" element={<RuleSetEdit />} />
                <Route path="show/:id" element={<RuleSetShow />} />
              </Route>

              {/* Approvals Routes */}
              <Route path="/approvals">
                <Route index element={<ApprovalList />} />
                <Route path="show/:id" element={<ApprovalShow />} />
              </Route>

              {/* Audit Logs Routes */}
              <Route path="/audit-logs">
                <Route index element={<AuditLogList />} />
                <Route path="show/:id" element={<AuditLogShow />} />
              </Route>

              {/* Worklist Routes */}
              <Route path="/worklist">
                <Route index element={<WorklistList />} />
              </Route>

              {/* Transactions Routes */}
              <Route path="/transactions">
                <Route index element={<TransactionList />} />
                <Route path="show/:id" element={<TransactionShow />} />
              </Route>

              {/* Cases Routes */}
              <Route path="/cases">
                <Route index element={<CasesList />} />
                <Route path="create" element={<CasesCreate />} />
                <Route path="show/:id" element={<CasesShow />} />
              </Route>

              {/* Transaction Metrics */}
              <Route path="/transaction-metrics">
                <Route index element={<TransactionMetrics />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<ErrorComponent />} />
            </Route>

            {/* Login Route */}
            <Route
              element={
                <Authenticated key="authenticated-login" fallback={<Outlet />}>
                  <DefaultRoute />
                </Authenticated>
              }
            >
              <Route path="/login" element={<LoginPage />} />
            </Route>
          </Routes>

          <UnsavedChangesNotifier />
          <DocumentTitleHandler
            handler={({ resource, action, params }) => {
              const appTitle = "Fraud Intelligence Portal";
              if (resource == null) return appTitle;
              const resourceName = resource.meta?.label ?? resource.name ?? "";
              if (action === "list") return `${resourceName} | ${appTitle}`;
              if (action === "show" && params?.id != null)
                return `${resourceName} #${params.id} | ${appTitle}`;
              if (action === "edit" && params?.id != null)
                return `Edit ${resourceName} | ${appTitle}`;
              if (action === "create") return `Create ${resourceName} | ${appTitle}`;
              return appTitle;
            }}
          />

          {/* Global Command Palette */}
          <CommandPalette />
        </Refine>
      </AntdApp>
    </ConfigProvider>
  );
}

/**
 * Main App Component with ThemeProvider
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
