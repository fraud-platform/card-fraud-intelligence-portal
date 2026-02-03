/**
 * Route Definitions
 *
 * Centralized route configuration for the application.
 * Defines all resource routes and their components.
 */

import { ResourceProps } from "@refinedev/core";
import {
  DatabaseOutlined,
  FileTextOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  DollarOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  ContainerOutlined,
} from "@ant-design/icons";

/**
 * Resource definitions for Refine
 *
 * Organized into two groups:
 * 1. Rule Management - For rule engineers to author and manage rules
 * 2. Fraud Operations - For fraud analysts to review transactions
 */
export const resources: ResourceProps[] = [
  // ===========================================
  // Rule Management Group
  // ===========================================
  {
    name: "rule-fields",
    list: "/rule-fields",
    create: "/rule-fields/create",
    edit: "/rule-fields/edit/:id",
    meta: {
      label: "Rule Fields",
      icon: <DatabaseOutlined />,
      group: "Rule Management",
    },
  },
  {
    name: "rules",
    list: "/rules",
    create: "/rules/create",
    edit: "/rules/edit/:id",
    show: "/rules/show/:id",
    meta: {
      label: "Rules",
      icon: <FileTextOutlined />,
      group: "Rule Management",
    },
  },
  {
    name: "rulesets",
    list: "/rulesets",
    create: "/rulesets/create",
    edit: "/rulesets/edit/:id",
    show: "/rulesets/show/:id",
    meta: {
      label: "Rule Sets",
      icon: <FolderOutlined />,
      group: "Rule Management",
    },
  },
  {
    name: "approvals",
    list: "/approvals",
    show: "/approvals/show/:id",
    meta: {
      label: "Approvals",
      icon: <CheckCircleOutlined />,
      group: "Rule Management",
    },
  },
  {
    name: "audit-logs",
    list: "/audit-logs",
    show: "/audit-logs/show/:id",
    meta: {
      label: "Audit Logs",
      icon: <AuditOutlined />,
      group: "Rule Management",
    },
  },
  // ===========================================
  // Fraud Operations Group
  // ===========================================
  {
    name: "analyst-home",
    list: "/analyst-home",
    meta: {
      label: "Analyst Home",
      icon: <UnorderedListOutlined />,
      group: "Fraud Operations",
    },
  },
  {
    name: "worklist",
    list: "/worklist",
    meta: {
      label: "Worklist",
      icon: <UnorderedListOutlined />,
      group: "Fraud Operations",
    },
  },
  {
    name: "transactions",
    list: "/transactions",
    show: "/transactions/show/:id",
    meta: {
      label: "All Transactions",
      icon: <DollarOutlined />,
      group: "Fraud Operations",
    },
  },
  {
    name: "cases",
    list: "/cases",
    create: "/cases/create",
    show: "/cases/show/:id",
    meta: {
      label: "Cases",
      icon: <ContainerOutlined />,
      group: "Fraud Operations",
    },
  },
  {
    name: "transaction-metrics",
    list: "/transaction-metrics",
    meta: {
      label: "Metrics",
      icon: <BarChartOutlined />,
      group: "Fraud Operations",
    },
  },
];

export default resources;
