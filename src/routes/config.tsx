/**
 * Router Configuration
 *
 * Centralized route definitions extracted from App.tsx.
 * Supports React.lazy for code splitting and provides a clean data-driven approach.
 */

import { lazy } from "react";
import { Outlet } from "react-router";

// Eagerly loaded components (critical for first paint)
import { EnterpriseLayout } from "../shared/components/Layout";
const LoginPage = lazy(() => import("../pages/Login").then((m) => ({ default: m.LoginPage })));
import { CallbackPage } from "../pages/Callback";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";

// Lazy-loaded resource components for code splitting
const RuleFieldList = lazy(() =>
  import("../resources/ruleFields/list").then((m) => ({ default: m.RuleFieldList }))
);
const RuleFieldCreate = lazy(() =>
  import("../resources/ruleFields/create").then((m) => ({ default: m.RuleFieldCreate }))
);
const RuleFieldEdit = lazy(() =>
  import("../resources/ruleFields/edit").then((m) => ({ default: m.RuleFieldEdit }))
);

const RuleList = lazy(() =>
  import("../resources/rules/list").then((m) => ({ default: m.RuleList }))
);
const RuleCreate = lazy(() =>
  import("../resources/rules/create").then((m) => ({ default: m.RuleCreate }))
);
const RuleEdit = lazy(() =>
  import("../resources/rules/edit").then((m) => ({ default: m.RuleEdit }))
);
const RuleShow = lazy(() =>
  import("../resources/rules/show").then((m) => ({ default: m.RuleShow }))
);

const RuleSetList = lazy(() =>
  import("../resources/ruleSets/list").then((m) => ({ default: m.RuleSetList }))
);
const RuleSetCreate = lazy(() =>
  import("../resources/ruleSets/create").then((m) => ({ default: m.RuleSetCreate }))
);
const RuleSetEdit = lazy(() =>
  import("../resources/ruleSets/edit").then((m) => ({ default: m.RuleSetEdit }))
);
const RuleSetShow = lazy(() =>
  import("../resources/ruleSets/show").then((m) => ({ default: m.RuleSetShow }))
);

const ApprovalList = lazy(() =>
  import("../resources/approvals/list").then((m) => ({ default: m.ApprovalList }))
);
const ApprovalShow = lazy(() =>
  import("../resources/approvals/show").then((m) => ({ default: m.ApprovalShow }))
);

const AuditLogList = lazy(() =>
  import("../resources/auditLogs/list").then((m) => ({ default: m.AuditLogList }))
);
const AuditLogShow = lazy(() =>
  import("../resources/auditLogs/show").then((m) => ({ default: m.AuditLogShow }))
);

const WorklistList = lazy(() =>
  import("../resources/worklist/list").then((m) => ({ default: m.default }))
);
const TransactionList = lazy(() =>
  import("../resources/transactions/list").then((m) => ({ default: m.TransactionList }))
);
const TransactionShow = lazy(() =>
  import("../resources/transactions/show").then((m) => ({ default: m.TransactionShow }))
);
const TransactionMetrics = lazy(() =>
  import("../resources/transactions/metrics").then((m) => ({ default: m.TransactionMetrics }))
);

const CasesList = lazy(() =>
  import("../resources/cases/list").then((m) => ({ default: m.default }))
);
const CasesShow = lazy(() =>
  import("../resources/cases/show").then((m) => ({ default: m.default }))
);
const CasesCreate = lazy(() =>
  import("../resources/cases/create").then((m) => ({ default: m.default }))
);

// Analyst home
const AnalystHome = lazy(() =>
  import("../resources/home/AnalystHome").then((m) => ({ default: m.default }))
);

// Error component from refine
const ErrorComponent = lazy(() =>
  import("@refinedev/antd").then((m) => ({ default: m.ErrorComponent }))
);

import { DefaultRoute } from "./components";
import { withSuspense } from "./withSuspense";
import { RouteConfig } from "./types";
import { getCommandPaletteRoutes as getRoutesForPalette } from "./utils";

// Create suspense-wrapped components
const RuleFieldListPage = withSuspense(() => <RuleFieldList />);
const RuleFieldCreatePage = withSuspense(() => <RuleFieldCreate />);
const RuleFieldEditPage = withSuspense(() => <RuleFieldEdit />);

const RuleListPage = withSuspense(() => <RuleList />);
const RuleCreatePage = withSuspense(() => <RuleCreate />);
const RuleEditPage = withSuspense(() => <RuleEdit />);
const RuleShowPage = withSuspense(() => <RuleShow />);

const RuleSetListPage = withSuspense(() => <RuleSetList />);
const RuleSetCreatePage = withSuspense(() => <RuleSetCreate />);
const RuleSetEditPage = withSuspense(() => <RuleSetEdit />);
const RuleSetShowPage = withSuspense(() => <RuleSetShow />);

const ApprovalListPage = withSuspense(() => <ApprovalList />);
const ApprovalShowPage = withSuspense(() => <ApprovalShow />);

const AuditLogListPage = withSuspense(() => <AuditLogList />);
const AuditLogShowPage = withSuspense(() => <AuditLogShow />);

const WorklistListPage = withSuspense(() => <WorklistList />);
const TransactionListPage = withSuspense(() => <TransactionList />);
const TransactionShowPage = withSuspense(() => <TransactionShow />);
const TransactionMetricsPage = withSuspense(() => <TransactionMetrics />);

const CasesListPage = withSuspense(() => <CasesList />);
const CasesShowPage = withSuspense(() => <CasesShow />);
const CasesCreatePage = withSuspense(() => <CasesCreate />);

const AnalystHomePage = withSuspense(() => <AnalystHome />);
const ErrorPage = withSuspense(() => <ErrorComponent />);

/**
 * Main route configuration
 */
export const routeConfig: RouteConfig[] = [
  {
    path: "/callback",
    element: <CallbackPage />,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <EnterpriseLayout>
          <Outlet />
        </EnterpriseLayout>
      </ErrorBoundary>
    ),
    meta: { requiresAuth: true },
    children: [
      {
        index: true,
        path: "",
        element: <DefaultRoute />,
        meta: { title: "Home" },
      },
      // Rule Fields
      {
        path: "rule-fields",
        element: <Outlet />,
        meta: { title: "Rule Fields" },
        children: [
          { index: true, path: "", element: <RuleFieldListPage /> },
          { path: "create", element: <RuleFieldCreatePage /> },
          { path: "edit/:id", element: <RuleFieldEditPage /> },
        ],
      },
      // Rules
      {
        path: "rules",
        element: <Outlet />,
        meta: { title: "Rules" },
        children: [
          { index: true, path: "", element: <RuleListPage /> },
          { path: "create", element: <RuleCreatePage /> },
          { path: "edit/:id", element: <RuleEditPage /> },
          { path: "show/:id", element: <RuleShowPage /> },
        ],
      },
      // Rule Sets
      {
        path: "rulesets",
        element: <Outlet />,
        meta: { title: "Rule Sets" },
        children: [
          { index: true, path: "", element: <RuleSetListPage /> },
          { path: "create", element: <RuleSetCreatePage /> },
          { path: "edit/:id", element: <RuleSetEditPage /> },
          { path: "show/:id", element: <RuleSetShowPage /> },
        ],
      },
      // Approvals
      {
        path: "approvals",
        element: <Outlet />,
        meta: { title: "Approvals" },
        children: [
          { index: true, path: "", element: <ApprovalListPage /> },
          { path: "show/:id", element: <ApprovalShowPage /> },
        ],
      },
      // Audit Logs
      {
        path: "audit-logs",
        element: <Outlet />,
        meta: { title: "Audit Logs" },
        children: [
          { index: true, path: "", element: <AuditLogListPage /> },
          { path: "show/:id", element: <AuditLogShowPage /> },
        ],
      },
      // Worklist
      {
        path: "worklist",
        element: <Outlet />,
        meta: { title: "Worklist", permissions: ["review:transactions"] },
        children: [{ index: true, path: "", element: <WorklistListPage /> }],
      },
      // Transactions
      {
        path: "transactions",
        element: <Outlet />,
        meta: { title: "Transactions" },
        children: [
          { index: true, path: "", element: <TransactionListPage /> },
          { path: "show/:id", element: <TransactionShowPage /> },
        ],
      },
      // Cases
      {
        path: "cases",
        element: <Outlet />,
        meta: { title: "Cases" },
        children: [
          { index: true, path: "", element: <CasesListPage /> },
          { path: "create", element: <CasesCreatePage /> },
          { path: "show/:id", element: <CasesShowPage /> },
        ],
      },
      // Transaction Metrics
      {
        path: "transaction-metrics",
        element: <Outlet />,
        meta: { title: "Metrics" },
        children: [{ index: true, path: "", element: <TransactionMetricsPage /> }],
      },
      // Analyst Home
      {
        path: "analyst-home",
        element: <Outlet />,
        meta: { title: "Analyst Home" },
        children: [{ index: true, path: "", element: <AnalystHomePage /> }],
      },
      // Catch all
      {
        path: "*",
        element: <ErrorPage />,
        meta: { title: "Not Found" },
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    meta: { requiresAuth: false, title: "Login" },
  },
];

/**
 * Get all route paths for command palette
 */
export function getCommandPaletteRoutes(): Array<{
  path: string;
  title: string;
  keywords?: string[];
}> {
  return getRoutesForPalette(routeConfig);
}

export { convertToRouteObjects, flattenRoutes } from "./utils";
