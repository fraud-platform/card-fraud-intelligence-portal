import React, { type FC, type ComponentProps } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router";
import { ConfigProvider, Spin, theme as antdTheme } from "antd";
// Patch Ant Design Card to map legacy `bordered` prop to `variant` to avoid deprecation warnings
import "./shared/compat/antdCardCompat";
import "./shared/styles/common.css";
import { Refine, Authenticated } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import {
  ErrorComponent,
  ThemedLayout,
  ThemedTitle,
  useNotificationProvider,
  RefineThemes,
} from "@refinedev/antd";

import { dataProvider } from "./app/dataProvider";
import { authProvider } from "./app/authProvider";
import { accessControlProvider } from "./app/accessControlProvider";
import { resources } from "./app/routes";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { usePermissions } from "./hooks/usePermissions";

import LoginPage from "./pages/Login";
import { CallbackPage } from "./pages/Callback";

import RuleFieldList from "./resources/ruleFields/list";
import RuleFieldCreate from "./resources/ruleFields/create";
import RuleFieldEdit from "./resources/ruleFields/edit";

import RuleList from "./resources/rules/list";
import RuleCreate from "./resources/rules/create";
import RuleEdit from "./resources/rules/edit";
import RuleShow from "./resources/rules/show";

import RuleSetList from "./resources/ruleSets/list";
import RuleSetCreate from "./resources/ruleSets/create";
import RuleSetEdit from "./resources/ruleSets/edit";
import RuleSetShow from "./resources/ruleSets/show";

import ApprovalList from "./resources/approvals/list";
import ApprovalShow from "./resources/approvals/show";

import AuditLogList from "./resources/auditLogs/list";
import AuditLogShow from "./resources/auditLogs/show";

import TransactionList from "./resources/transactions/list";
import TransactionShow from "./resources/transactions/show";
import TransactionMetrics from "./resources/transactions/metrics";

import WorklistList from "./resources/worklist/list";
import AnalystHome from "./resources/home/AnalystHome";

import CasesList from "./resources/cases/list";
import CasesShow from "./resources/cases/show";
import CasesCreate from "./resources/cases/create";

const AppTitle: FC<ComponentProps<typeof ThemedTitle>> = (props) => (
  <ThemedTitle {...props} text="Fraud Intelligence Portal" />
);

const DefaultRoute: FC = () => {
  const { capabilities, isLoading } = usePermissions();
  if (isLoading) {
    return (
      <div className="centered-container">
        <Spin size="large" />
      </div>
    );
  }

  if (capabilities.canReviewTransactions || capabilities.canViewTransactions) {
    return <Navigate to="/analyst-home" replace />;
  }

  return <Navigate to="/rule-fields" replace />;
};

const AppLayout: FC = () => {
  return (
    <ThemedLayout Title={AppTitle}>
      <Outlet />
    </ThemedLayout>
  );
};

function App(): React.ReactElement {
  const notificationProvider = useNotificationProvider();

  return (
    <ConfigProvider
      componentSize="small"
      theme={{
        ...RefineThemes.Blue,
        algorithm: [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
      }}
    >
      <ErrorBoundary>
        <Refine
          dataProvider={dataProvider}
          routerProvider={routerProvider}
          authProvider={authProvider}
          accessControlProvider={accessControlProvider}
          notificationProvider={() => notificationProvider}
          resources={resources}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: "fraud-intelligence-portal",
          }}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/callback" element={<CallbackPage />} />

            <Route
              element={
                <Authenticated key="auth" fallback={<Navigate to="/login" replace />}>
                  <AppLayout />
                </Authenticated>
              }
            >
              <Route index element={<DefaultRoute />} />

              <Route path="/rule-fields">
                <Route index element={<RuleFieldList />} />
                <Route path="create" element={<RuleFieldCreate />} />
                <Route path="edit/:id" element={<RuleFieldEdit />} />
              </Route>

              <Route path="/rules">
                <Route index element={<RuleList />} />
                <Route path="create" element={<RuleCreate />} />
                <Route path="edit/:id" element={<RuleEdit />} />
                <Route path="show/:id" element={<RuleShow />} />
              </Route>

              <Route path="/rulesets">
                <Route index element={<RuleSetList />} />
                <Route path="create" element={<RuleSetCreate />} />
                <Route path="edit/:id" element={<RuleSetEdit />} />
                <Route path="show/:id" element={<RuleSetShow />} />
              </Route>

              <Route path="/approvals">
                <Route index element={<ApprovalList />} />
                <Route path="show/:id" element={<ApprovalShow />} />
              </Route>

              <Route path="/audit-logs">
                <Route index element={<AuditLogList />} />
                <Route path="show/:id" element={<AuditLogShow />} />
              </Route>

              <Route path="/worklist">
                <Route index element={<WorklistList />} />
              </Route>

              <Route path="/analyst-home">
                <Route index element={<AnalystHome />} />
              </Route>

              <Route path="/transactions">
                <Route index element={<TransactionList />} />
                <Route path="show/:id" element={<TransactionShow />} />
              </Route>

              <Route path="/cases">
                <Route index element={<CasesList />} />
                <Route path="create" element={<CasesCreate />} />
                <Route path="show/:id" element={<CasesShow />} />
              </Route>

              <Route path="/transaction-metrics">
                <Route index element={<TransactionMetrics />} />
              </Route>

              <Route path="*" element={<ErrorComponent />} />
            </Route>

            <Route path="*" element={<ErrorComponent />} />
          </Routes>
        </Refine>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
