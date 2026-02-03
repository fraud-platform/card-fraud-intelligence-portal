/**
 * MSW Request Handlers
 *
 * Mock implementations for all API endpoints
 */

import { http, HttpResponse, delay } from "msw";
import { RuleFieldStore } from "./data/ruleFields";
import { RuleStore } from "./data/rules";
import { RuleSetStore } from "./data/ruleSets";
import { ApprovalStore } from "./data/approvals";
import { AuditLogStore } from "./data/auditLogs";
import { User, AuthResponse } from "../types/domain";
import { ApprovalStatus, RuleStatus, RuleSetStatus, RulesetEnvironment } from "../types/enums";

// Initialize stores (stores are auto-populated with seed data from their constructors)
const ruleFieldStore = new RuleFieldStore();
const ruleStore = new RuleStore();
const ruleSetStore = new RuleSetStore();
const approvalStore = new ApprovalStore();
const auditLogStore = new AuditLogStore();

/**
 * Verify that mock data is properly initialized
 * Logs the count of items in each store for debugging purposes
 */
export function verifyMockDataInitialization(): void {
  const fieldCount = ruleFieldStore.getAll().length;
  const ruleCount = ruleStore.getAllRules().length;
  const rulesetCount = ruleSetStore.getAll().length;
  const approvalCount = approvalStore.getAll().length;
  const auditLogCount = auditLogStore.getAll().length;

  console.warn("[MSW] Mock Data Initialized:", {
    ruleFields: fieldCount,
    rules: ruleCount,
    rulesets: rulesetCount,
    approvals: approvalCount,
    auditLogs: auditLogCount,
  });

  // Warn if any store is empty (should not happen with proper seed data)
  if (fieldCount === 0) console.error("[MSW] WARNING: RuleFieldStore is empty!");
  if (ruleCount === 0) console.error("[MSW] WARNING: RuleStore is empty!");
  if (rulesetCount === 0) console.error("[MSW] WARNING: RuleSetStore is empty!");
  if (approvalCount === 0) console.error("[MSW] WARNING: ApprovalStore is empty!");
  if (auditLogCount === 0) console.error("[MSW] WARNING: AuditLogStore is empty!");
}

// Verify initialization on module load
verifyMockDataInitialization();

// Mock users
const defaultMakerUser: User = {
  user_id: "user_maker_1",
  username: "maker1",
  display_name: "John Maker",
  roles: ["RULE_MAKER"],
  email: "maker1@example.com",
};

const mockUsers: Record<string, User> = {
  user_maker_1: defaultMakerUser,
  user_maker_2: {
    user_id: "user_maker_2",
    username: "maker2",
    display_name: "Jane Maker",
    roles: ["RULE_MAKER"],
    email: "maker2@example.com",
  },
  user_checker_1: {
    user_id: "user_checker_1",
    username: "checker1",
    display_name: "Bob Checker",
    roles: ["RULE_CHECKER"],
    email: "checker1@example.com",
  },
  user_checker_2: {
    user_id: "user_checker_2",
    username: "checker2",
    display_name: "Alice Checker",
    roles: ["RULE_CHECKER"],
    email: "checker2@example.com",
  },
};

// Mock session storage
let currentUser: User = defaultMakerUser;

// Helper: Add artificial delay for realism
const addDelay = () => delay(300);

// Helper: Parse keyset pagination params
export const parseKeysetPagination = (url: URL) => {
  const cursor = url.searchParams.get("cursor");
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "50", 10);
  const direction = (url.searchParams.get("direction") ?? "next") as "next" | "prev";
  return { cursor, limit, direction };
};

// Helper: Generate a simple cursor from item id (works in Node and browser)
const base64EncodeUtf8 = (str: string): string => {
  // Prefer Buffer in Node-like envs
  if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
    return Buffer.from(str).toString("base64");
  }
  // Browser-safe: use TextEncoder -> binary string -> btoa
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const base64DecodeUtf8 = (b64: string): string => {
  if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  // Browser-safe: atob -> bytes -> TextDecoder
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

// Helper: Generate a simple cursor from item id
const encodeCursor = (id: string | number): string => {
  return base64EncodeUtf8(String(id));
};

// Helper: Decode cursor to item id
const decodeCursor = (cursor: string | null): string | null => {
  if (cursor == null) return null;
  try {
    return base64DecodeUtf8(cursor);
  } catch {
    return null;
  }
};

// Helper: Apply keyset pagination
export const keysetPaginate = <T extends object>(
  items: T[],
  cursor: string | null,
  limit: number,
  direction: "next" | "prev",
  idField: string
): {
  items: T[];
  next_cursor: string | null;
  prev_cursor: string | null;
  has_next: boolean;
  has_prev: boolean;
} => {
  const sorted = [...items].sort((a, b) => {
    const idA = String((a as Record<string, unknown>)[idField] ?? "");
    const idB = String((b as Record<string, unknown>)[idField] ?? "");
    return idA.localeCompare(idB);
  });

  let startIndex = 0;
  if (cursor != null) {
    const decodedId = decodeCursor(cursor);
    const foundIndex = sorted.findIndex(
      (item) => String((item as Record<string, unknown>)[idField] ?? "") === decodedId
    );
    if (foundIndex !== -1) {
      startIndex = direction === "next" ? foundIndex + 1 : Math.max(0, foundIndex - limit);
    }
  }

  let endIndex: number;
  if (direction === "prev") {
    endIndex = startIndex + limit;
    startIndex = Math.max(0, startIndex - limit);
  } else {
    endIndex = startIndex + limit;
  }

  const paginatedItems = sorted.slice(startIndex, endIndex);

  const nextCursor =
    endIndex < sorted.length
      ? encodeCursor(String((sorted[endIndex] as Record<string, unknown>)?.[idField] ?? ""))
      : null;
  const prevCursor =
    startIndex > 0
      ? encodeCursor(String((sorted[startIndex - 1] as Record<string, unknown>)?.[idField] ?? ""))
      : null;

  return {
    items: paginatedItems,
    next_cursor: nextCursor,
    prev_cursor: prevCursor,
    has_next: endIndex < sorted.length,
    has_prev: startIndex > 0,
  };
};

// Helper: Filter by query params
export const applyFilters = <T extends Record<string, any>>(
  items: T[],
  params: URLSearchParams,
  filterableFields: string[]
): T[] => {
  let filtered = items;

  filterableFields.forEach((field) => {
    const value = params.get(field);
    if (value != null && value !== "") {
      filtered = filtered.filter((item) => {
        const itemValue = item[field];
        if (typeof itemValue === "string") {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        return String(itemValue) === value;
      });
    }
  });

  return filtered;
};

export const handlers = [
  // ============================================================================
  // Authentication
  // ============================================================================

  http.post("/api/v1/auth/login", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as { username: string; password: string };

    // Accept any credentials, return mock user
    const user =
      Object.values(mockUsers).find((u) => u.username === body.username) ?? defaultMakerUser;

    currentUser = user;

    const response: AuthResponse = {
      token: `mock_token_${user.user_id}_${Date.now()}`,
      user,
    };

    return HttpResponse.json(response);
  }),

  http.post("/api/v1/auth/logout", async () => {
    await addDelay();
    // Reset to default user (simulating logout but keeping a valid user for development)
    currentUser = defaultMakerUser;
    return HttpResponse.json({ success: true });
  }),

  http.get("/api/v1/auth/me", async () => {
    await addDelay();
    return HttpResponse.json(currentUser);
  }),

  http.post("/api/v1/auth/refresh", async () => {
    await addDelay();
    const response: AuthResponse = {
      token: `mock_token_${currentUser.user_id}_${Date.now()}`,
      user: currentUser,
    };

    return HttpResponse.json(response);
  }),

  // ============================================================================
  // Rule Fields
  // ============================================================================

  http.get("/api/v1/rule-fields", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    let fields = ruleFieldStore.getAll();
    fields = applyFilters(fields, url.searchParams, ["data_type", "is_active", "is_sensitive"]);

    const result = keysetPaginate(fields, cursor, limit, direction, "field_key");
    return HttpResponse.json({ ...result, limit });
  }),

  http.post("/api/v1/rule-fields", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const field = ruleFieldStore.create(body);
    return HttpResponse.json(field, { status: 201 });
  }),

  http.get("/api/v1/rule-fields/:fieldKey", async ({ params }) => {
    await addDelay();
    const field = ruleFieldStore.getByKey(params.fieldKey as string);
    if (field == null) {
      return HttpResponse.json({ error: "Field not found" }, { status: 404 });
    }
    return HttpResponse.json(field);
  }),

  http.put("/api/v1/rule-fields/:fieldKey", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const field = ruleFieldStore.update(params.fieldKey as string, body);
    if (field == null) {
      return HttpResponse.json({ error: "Field not found" }, { status: 404 });
    }
    return HttpResponse.json(field);
  }),

  http.delete("/api/v1/rule-fields/:fieldKey", async ({ params }) => {
    await addDelay();
    const deleted = ruleFieldStore.delete(params.fieldKey as string);
    if (deleted == null || deleted === false) {
      return HttpResponse.json({ error: "Field not found" }, { status: 404 });
    }
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  // Rule Field Metadata
  http.get("/api/v1/rule-fields/:fieldKey/metadata", async ({ params }) => {
    await addDelay();
    const metadata = ruleFieldStore.getMetadata(params.fieldKey as string);
    return HttpResponse.json(metadata);
  }),

  http.post("/api/v1/rule-fields/:fieldKey/metadata", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const meta = ruleFieldStore.setMetadata(
      params.fieldKey as string,
      body.meta_key,
      body.meta_value
    );
    return HttpResponse.json(meta, { status: 201 });
  }),

  http.delete("/api/v1/rule-fields/:fieldKey/metadata/:metaKey", async ({ params }) => {
    await addDelay();
    const deleted = ruleFieldStore.deleteMetadata(
      params.fieldKey as string,
      params.metaKey as string
    );
    if (deleted == null || deleted === false) {
      return HttpResponse.json({ error: "Metadata not found" }, { status: 404 });
    }
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  // ============================================================================
  // Rules
  // ============================================================================

  http.get("/api/v1/rules", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    let rules = ruleStore.getAllRules();
    const search = url.searchParams.get("search");
    if (search != null && search !== "") {
      const term = search.toLowerCase();
      rules = rules.filter((rule) => rule.rule_name.toLowerCase().includes(term));
    }
    rules = applyFilters(rules, url.searchParams, ["rule_type", "status", "created_by"]);

    const result = keysetPaginate(rules, cursor, limit, direction, "rule_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.post("/api/v1/rules", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const now = new Date().toISOString();
    const rule = ruleStore.createRule({
      rule_id: `rule_${Date.now()}`,
      rule_name: body.rule_name,
      description: body.description ?? null,
      rule_type: body.rule_type,
      status: RuleStatus.DRAFT,
      created_by: currentUser.user_id,
      updated_at: now,
    });
    return HttpResponse.json(rule, { status: 201 });
  }),

  http.get("/api/v1/rules/:ruleId", async ({ params }) => {
    await addDelay();
    const ruleWithVersion = ruleStore.getRuleWithVersion(params.ruleId as string);
    if (ruleWithVersion == null) {
      return HttpResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    return HttpResponse.json(ruleWithVersion);
  }),

  http.put("/api/v1/rules/:ruleId", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const rule = ruleStore.updateRule(params.ruleId as string, body);
    if (rule == null) {
      return HttpResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    return HttpResponse.json(rule);
  }),

  http.delete("/api/v1/rules/:ruleId", async ({ params }) => {
    await addDelay();
    const deleted = ruleStore.deleteRule(params.ruleId as string);
    if (deleted == null || deleted === false) {
      return HttpResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  http.post("/api/v1/rules/:ruleId/submit", async ({ params }) => {
    await addDelay();
    const rule = ruleStore.updateRule(params.ruleId as string, {
      status: RuleStatus.PENDING_APPROVAL,
    });
    if (!rule) {
      return HttpResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    // Create approval request
    approvalStore.create({
      approval_id: `appr_${Date.now()}`,
      entity_type: "RULE" as any,
      entity_id: rule.rule_id,
      action: "SUBMIT" as any,
      maker: currentUser.user_id,
      status: ApprovalStatus.PENDING,
    });

    return HttpResponse.json(rule);
  }),

  // Rule Versions
  http.get("/api/v1/rules/:ruleId/versions", async ({ params }) => {
    await addDelay();
    const versions = ruleStore.getVersions(params.ruleId as string);
    return HttpResponse.json(versions);
  }),

  http.post("/api/v1/rules/:ruleId/versions", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const version = ruleStore.createVersion({
      rule_version_id: `rv_${params.ruleId}_v${Date.now()}`,
      rule_id: params.ruleId as string,
      condition_tree: body.condition_tree,
      priority: body.priority || 50,
      scope: body.scope ?? null,
      created_by: currentUser.user_id,
      status: RuleStatus.DRAFT,
      approved_by: null,
      approved_at: null,
    });
    return HttpResponse.json(version, { status: 201 });
  }),

  http.get("/api/v1/rules/:ruleId/versions/:versionId", async ({ params }) => {
    await addDelay();
    const version = ruleStore.getVersion(params.ruleId as string, params.versionId as string);
    if (version == null) {
      return HttpResponse.json({ error: "Version not found" }, { status: 404 });
    }
    return HttpResponse.json(version);
  }),

  // ============================================================================
  // RuleSets
  // ============================================================================

  http.get("/api/v1/rulesets", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    let ruleSets = ruleSetStore.getAll();
    ruleSets = applyFilters(ruleSets, url.searchParams, ["rule_type", "status"]);

    const result = keysetPaginate(ruleSets, cursor, limit, direction, "ruleset_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.post("/api/v1/rulesets", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const now = new Date().toISOString();
    const ruleSet = ruleSetStore.create({
      ruleset_id: `rs_${Date.now()}`,
      name: body.name ?? null,
      description: body.description ?? null,
      rule_type: body.rule_type,
      environment: body.environment ?? RulesetEnvironment.LOCAL,
      region: body.region ?? "GLOBAL",
      country: body.country ?? "GLOBAL",
      status: RuleSetStatus.DRAFT,
      compiled_ast: null,
      created_by: "test_user@example.com",
      approved_by: null,
      created_at: now,
      updated_at: now,
      approved_at: null,
      activated_at: null,
    });
    return HttpResponse.json(ruleSet, { status: 201 });
  }),

  http.get("/api/v1/rulesets/:rulesetId", async ({ params }) => {
    await addDelay();
    const ruleSetWithRules = ruleSetStore.getWithRules(params.rulesetId as string);
    if (ruleSetWithRules == null) {
      return HttpResponse.json({ error: "RuleSet not found" }, { status: 404 });
    }
    return HttpResponse.json(ruleSetWithRules);
  }),

  http.put("/api/v1/rulesets/:rulesetId", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const ruleSet = ruleSetStore.update(params.rulesetId as string, body);
    if (ruleSet == null) {
      return HttpResponse.json({ error: "RuleSet not found" }, { status: 404 });
    }
    return HttpResponse.json(ruleSet);
  }),

  http.delete("/api/v1/rulesets/:rulesetId", async ({ params }) => {
    await addDelay();
    const deleted = ruleSetStore.delete(params.rulesetId as string);
    if (deleted == null || deleted === false) {
      return HttpResponse.json({ error: "RuleSet not found" }, { status: 404 });
    }
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  http.post("/api/v1/rulesets/:rulesetId/submit", async ({ params }) => {
    await addDelay();
    const ruleSet = ruleSetStore.update(params.rulesetId as string, {
      status: RuleSetStatus.PENDING_APPROVAL,
    });
    if (!ruleSet) {
      return HttpResponse.json({ error: "RuleSet not found" }, { status: 404 });
    }

    // Create approval request
    approvalStore.create({
      approval_id: `appr_${Date.now()}`,
      entity_type: "RULESET" as any,
      entity_id: ruleSet.ruleset_id,
      action: "SUBMIT" as any,
      maker: currentUser.user_id,
      status: ApprovalStatus.PENDING,
    });

    return HttpResponse.json(ruleSet);
  }),

  http.post("/api/v1/rulesets/:rulesetId/compile", async ({ params }) => {
    await addDelay();
    const ruleSet = ruleSetStore.compile(params.rulesetId as string);
    if (ruleSet == null) {
      return HttpResponse.json({ error: "RuleSet not found" }, { status: 404 });
    }
    return HttpResponse.json(ruleSet);
  }),

  // RuleSet Rules
  http.get("/api/v1/rulesets/:rulesetId/rules", async ({ params }) => {
    await addDelay();
    const ruleVersionIds = ruleSetStore.getRules(params.rulesetId as string);
    return HttpResponse.json(ruleVersionIds);
  }),

  http.post("/api/v1/rulesets/:rulesetId/rules", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const added = ruleSetStore.addRule(params.rulesetId as string, body.rule_version_id);
    if (added == null || added === false) {
      return HttpResponse.json({ error: "Failed to add rule" }, { status: 400 });
    }
    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  http.delete("/api/v1/rulesets/:rulesetId/rules/:ruleVersionId", async ({ params }) => {
    await addDelay();
    const removed = ruleSetStore.removeRule(
      params.rulesetId as string,
      params.ruleVersionId as string
    );
    if (removed == null || removed === false) {
      return HttpResponse.json({ error: "Rule not found in set" }, { status: 404 });
    }
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  // ============================================================================
  // Approvals
  // ============================================================================

  // Handle preflight requests and absolute-origin requests from tests
  http.options("/api/v1/approvals", async () => {
    // Return 204 No Content for preflight
    return HttpResponse.json({}, { status: 204 });
  }),

  // Some test code issues requests to explicit origin (http://localhost:8000), ensure we match those too
  http.get("http://localhost:8000/api/v1/approvals", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    let approvals = approvalStore.getAll();

    // Filter by status
    const status = url.searchParams.get("status");
    if (status) {
      approvals = approvals.filter((a) => a.status === status);
    }

    // Filter by entity_type
    const entityType = url.searchParams.get("entity_type");
    if (entityType) {
      approvals = approvals.filter((a) => a.entity_type === entityType);
    }

    const result = keysetPaginate(approvals, cursor, limit, direction, "approval_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.get("/api/v1/approvals", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    let approvals = approvalStore.getAll();

    // Filter by status
    const status = url.searchParams.get("status");
    if (status) {
      approvals = approvals.filter((a) => a.status === status);
    }

    // Filter by entity_type
    const entityType = url.searchParams.get("entity_type");
    if (entityType) {
      approvals = approvals.filter((a) => a.entity_type === entityType);
    }

    const result = keysetPaginate(approvals, cursor, limit, direction, "approval_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.post("/api/v1/approvals", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const approval = approvalStore.create({
      approval_id: `appr_${Date.now()}`,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      action: body.action,
      maker: currentUser.user_id,
      status: ApprovalStatus.PENDING,
    });
    return HttpResponse.json(approval, { status: 201 });
  }),

  http.get("/api/v1/approvals/:approvalId", async ({ params }) => {
    await addDelay();
    const approval = approvalStore.getById(params.approvalId as string);
    if (approval == null) {
      return HttpResponse.json({ error: "Approval not found" }, { status: 404 });
    }
    return HttpResponse.json(approval);
  }),

  http.post("/api/v1/approvals/:approvalId/decide", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const approval = approvalStore.decide(params.approvalId as string, {
      checker: currentUser.user_id,
      status: body.status,
      remarks: body.remarks,
    });

    if (approval == null) {
      return HttpResponse.json({ error: "Approval not found or already decided" }, { status: 404 });
    }

    return HttpResponse.json(approval);
  }),

  // ============================================================================
  // Audit Logs
  // ============================================================================

  http.get("/api/v1/audit-log", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    let logs = auditLogStore.getAll();

    // Filter by entity_type
    const entityType = url.searchParams.get("entity_type");
    if (entityType) {
      logs = logs.filter((log) => log.entity_type === entityType);
    }

    // Filter by entity_id
    const entityId = url.searchParams.get("entity_id");
    if (entityId) {
      logs = logs.filter((log) => log.entity_id === entityId);
    }

    // Filter by action
    const action = url.searchParams.get("action");
    if (action) {
      logs = logs.filter((log) => log.action === action);
    }

    // Filter by user
    const userId = url.searchParams.get("performed_by");
    if (userId) {
      logs = logs.filter((log) => log.performed_by === userId);
    }

    const result = keysetPaginate(logs, cursor, limit, direction, "audit_id");
    return HttpResponse.json({ ...result, limit });
  }),

  // Backwards-compatible plural endpoint for the app's dataProvider (audit-logs)
  // Handle OPTIONS preflight for audit-logs
  http.options("/api/v1/audit-logs", async () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Support absolute-origin requests from tests (http://localhost:8000)
  http.get("http://localhost:8000/api/v1/audit-logs", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    let logs = auditLogStore.getAll();

    // Filter by entity_type
    const entityType = url.searchParams.get("entity_type");
    if (entityType) {
      logs = logs.filter((log) => log.entity_type === entityType);
    }

    // Filter by entity_id
    const entityId = url.searchParams.get("entity_id");
    if (entityId) {
      logs = logs.filter((log) => log.entity_id === entityId);
    }

    // Filter by action
    const action = url.searchParams.get("action");
    if (action) {
      logs = logs.filter((log) => log.action === action);
    }

    // Filter by user
    const userId = url.searchParams.get("performed_by");
    if (userId) {
      logs = logs.filter((log) => log.performed_by === userId);
    }

    const result = keysetPaginate(logs, cursor, limit, direction, "audit_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.get("/api/v1/audit-logs", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    let logs = auditLogStore.getAll();

    // Filter by entity_type
    const entityType = url.searchParams.get("entity_type");
    if (entityType) {
      logs = logs.filter((log) => log.entity_type === entityType);
    }

    // Filter by entity_id
    const entityId = url.searchParams.get("entity_id");
    if (entityId) {
      logs = logs.filter((log) => log.entity_id === entityId);
    }

    // Filter by action
    const action = url.searchParams.get("action");
    if (action) {
      logs = logs.filter((log) => log.action === action);
    }

    // Filter by user
    const userId = url.searchParams.get("performed_by");
    if (userId) {
      logs = logs.filter((log) => log.performed_by === userId);
    }

    const result = keysetPaginate(logs, cursor, limit, direction, "audit_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.get("/api/v1/audit-log/:auditId", async ({ params }) => {
    await addDelay();
    const log = auditLogStore.getById(params.auditId as string);
    if (log == null) {
      return HttpResponse.json({ error: "Audit log not found" }, { status: 404 });
    }
    return HttpResponse.json(log);
  }),

  // ============================================================================
  // Validation
  // ============================================================================

  http.post("/api/v1/validation/condition-tree", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;

    // Simple validation: check that condition tree has valid structure
    if (!body.condition_tree) {
      return HttpResponse.json(
        {
          valid: false,
          errors: ["condition_tree is required"],
        },
        { status: 400 }
      );
    }

    // Mock validation success
    return HttpResponse.json({
      valid: true,
      errors: [],
    });
  }),

  // ============================================================================
  // Cases
  // ============================================================================

  http.get("/api/v1/cases", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    // Generate mock cases
    const mockCases = [
      {
        case_id: "case_001",
        case_number: "CASE-2026-001",
        title: "High Risk Merchant Investigation",
        description: "Investigating suspicious merchant activity",
        case_type: "INVESTIGATION",
        status: "OPEN",
        priority: 1,
        assigned_to: "user_maker_1",
        created_by: "user_maker_1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        case_id: "case_002",
        case_number: "CASE-2026-002",
        title: "Card Compromise Report",
        description: "Potential card compromise detected",
        case_type: "CARD_COMPROMISE",
        status: "IN_PROGRESS",
        priority: 2,
        assigned_to: "user_checker_1",
        created_by: "user_checker_1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        case_id: "case_003",
        case_number: "CASE-2026-003",
        title: "Fraud Ring Pattern Analysis",
        description: "Analyzing potential fraud ring activity",
        case_type: "FRAUD_RING",
        status: "PENDING_REVIEW",
        priority: 1,
        assigned_to: null,
        created_by: "user_maker_1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    let cases = [...mockCases];
    cases = applyFilters(cases, url.searchParams, ["status", "case_type"]);

    const result = keysetPaginate(cases, cursor, limit, direction, "case_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.post("/api/v1/cases", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const now = new Date().toISOString();
    const newCase = {
      case_id: `case_${Date.now()}`,
      case_number: `CASE-2026-${String(Date.now()).slice(-3)}`,
      title: body.title ?? "Untitled Case",
      description: body.description ?? null,
      case_type: body.case_type ?? "INVESTIGATION",
      status: "OPEN",
      priority: body.priority ?? 3,
      assigned_to: body.assigned_to ?? currentUser.user_id,
      created_by: currentUser.user_id,
      created_at: now,
      updated_at: now,
      transactions: body.transaction_ids ?? [],
    };
    return HttpResponse.json(newCase, { status: 201 });
  }),

  http.get("/api/v1/cases/:caseId", async ({ params }) => {
    await addDelay();
    const mockCase = {
      case_id: params.caseId as string,
      case_number: "CASE-2026-001",
      title: "High Risk Merchant Investigation",
      description: "Investigating suspicious merchant activity",
      case_type: "INVESTIGATION",
      status: "OPEN",
      priority: 1,
      assigned_to: "user_maker_1",
      created_by: "user_maker_1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      transactions: [],
    };
    return HttpResponse.json(mockCase);
  }),

  http.put("/api/v1/cases/:caseId", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const updatedCase = {
      case_id: params.caseId as string,
      ...body,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(updatedCase);
  }),

  http.post("/api/v1/cases/:caseId/resolve", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const resolvedCase = {
      case_id: params.caseId as string,
      status: "RESOLVED",
      resolution_code: body.resolution_code ?? "RESOLVED",
      resolution_notes: body.resolution_notes ?? null,
      resolved_at: new Date().toISOString(),
      resolved_by: currentUser.user_id,
    };
    return HttpResponse.json(resolvedCase);
  }),

  http.get("/api/v1/cases/:caseId/transactions", async ({ params: _params }) => {
    await addDelay();
    // Return empty array or mock transactions
    return HttpResponse.json([]);
  }),

  http.post(
    "/api/v1/cases/:caseId/transactions",
    async ({ params: _params, request: _request }) => {
      await addDelay();
      return HttpResponse.json({ success: true }, { status: 201 });
    }
  ),

  http.delete("/api/v1/cases/:caseId/transactions/:txnId", async ({ params: _params }) => {
    await addDelay();
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  http.get("/api/v1/cases/:caseId/activity", async ({ params: _params }) => {
    await addDelay();
    const activity = [
      {
        activity_id: `act_${Date.now()}`,
        case_id: _params.caseId as string,
        action: "CREATED",
        performed_by: "user_maker_1",
        performed_at: new Date().toISOString(),
        details: "Case created",
      },
    ];
    return HttpResponse.json(activity);
  }),

  // ============================================================================
  // Transactions
  // ============================================================================

  http.get("/api/v1/transactions", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    // Generate mock transactions
    const mockTransactions = [
      {
        transaction_id: "txn_001",
        transaction_reference: "TXN-2026-001",
        card_token: "card_token_123",
        amount: 1500.0,
        currency: "USD",
        merchant_id: "merch_001",
        merchant_name: "Test Merchant",
        mcc: "5411",
        transaction_date: new Date().toISOString(),
        status: "PENDING_REVIEW",
        risk_level: "HIGH",
        decision: "DECLINE",
        evaluation_type: "POSTAUTH",
        assigned_to: "user_maker_1",
      },
      {
        transaction_id: "txn_002",
        transaction_reference: "TXN-2026-002",
        card_token: "card_token_456",
        amount: 250.0,
        currency: "USD",
        merchant_id: "merch_002",
        merchant_name: "Another Merchant",
        mcc: "5912",
        transaction_date: new Date().toISOString(),
        status: "UNDER_REVIEW",
        risk_level: "MEDIUM",
        decision: "APPROVE",
        evaluation_type: "AUTH",
        assigned_to: "user_checker_1",
      },
    ];

    let transactions = [...mockTransactions];
    transactions = applyFilters(transactions, url.searchParams, [
      "status",
      "risk_level",
      "decision",
    ]);

    const result = keysetPaginate(transactions, cursor, limit, direction, "transaction_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.get("/api/v1/transactions/:transactionId", async ({ params }) => {
    await addDelay();
    const transaction = {
      transaction_id: params.transactionId as string,
      transaction_reference: "TXN-2026-001",
      card_token: "card_token_123",
      amount: 1500.0,
      currency: "USD",
      merchant_id: "merch_001",
      merchant_name: "Test Merchant",
      mcc: "5411",
      transaction_date: new Date().toISOString(),
      status: "PENDING_REVIEW",
      risk_level: "HIGH",
      decision: "DECLINE",
      evaluation_type: "POSTAUTH",
      assigned_to: "user_maker_1",
      matched_rules: [],
    };
    return HttpResponse.json(transaction);
  }),

  http.get("/api/v1/transactions/:transactionId/overview", async ({ params }) => {
    await addDelay();
    const overview = {
      transaction_id: params.transactionId as string,
      transaction: {
        transaction_id: params.transactionId as string,
        transaction_reference: "TXN-2026-001",
        card_token: "card_token_123",
        amount: 1500.0,
        currency: "USD",
        merchant_id: "merch_001",
        merchant_name: "Test Merchant",
        mcc: "5411",
        transaction_date: new Date().toISOString(),
        status: "PENDING_REVIEW",
        risk_level: "HIGH",
        decision: "DECLINE",
        evaluation_type: "POSTAUTH",
        assigned_to: "user_maker_1",
      },
      review: {
        review_id: `review_${Date.now()}`,
        transaction_id: params.transactionId as string,
        status: "PENDING_REVIEW",
        assigned_to: "user_maker_1",
        assigned_at: new Date().toISOString(),
        priority: 1,
        risk_level: "HIGH",
      },
      notes: [],
      matched_rules: [],
    };
    return HttpResponse.json(overview);
  }),

  // ============================================================================
  // Worklist
  // ============================================================================

  http.get("/api/v1/worklist", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    // Generate mock worklist items
    const mockWorklist = [
      {
        transaction_id: "txn_001",
        transaction_reference: "TXN-2026-001",
        card_token: "card_token_123",
        amount: 1500.0,
        currency: "USD",
        merchant_name: "Test Merchant",
        transaction_date: new Date().toISOString(),
        status: "PENDING_REVIEW",
        risk_level: "HIGH",
        priority: 1,
        assigned_to: "user_maker_1",
        time_in_queue: "2h 30m",
      },
      {
        transaction_id: "txn_002",
        transaction_reference: "TXN-2026-002",
        card_token: "card_token_456",
        amount: 250.0,
        currency: "USD",
        merchant_name: "Another Merchant",
        transaction_date: new Date().toISOString(),
        status: "UNDER_REVIEW",
        risk_level: "MEDIUM",
        priority: 2,
        assigned_to: null,
        time_in_queue: "1h 15m",
      },
    ];

    let worklist = [...mockWorklist];
    worklist = applyFilters(worklist, url.searchParams, ["status", "risk_level", "assigned_to"]);

    const result = keysetPaginate(worklist, cursor, limit, direction, "transaction_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.get("/api/v1/worklist/stats", async () => {
    await addDelay();
    const stats = {
      pending_review: 15,
      assigned_to_me: 3,
      critical_risk: 2,
      high_risk: 5,
      unassigned: 8,
      total: 28,
    };
    return HttpResponse.json(stats);
  }),

  http.get("/api/v1/worklist/unassigned", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    const unassignedItems = [
      {
        transaction_id: "txn_003",
        transaction_reference: "TXN-2026-003",
        amount: 500.0,
        currency: "USD",
        merchant_name: "Unassigned Merchant",
        status: "PENDING_REVIEW",
        risk_level: "HIGH",
        priority: 1,
        assigned_to: null,
      },
    ];

    const result = keysetPaginate(unassignedItems, cursor, limit, direction, "transaction_id");
    return HttpResponse.json({ ...result, limit });
  }),

  http.post("/api/v1/worklist/claim", async () => {
    await addDelay();

    // Simulate claiming a transaction
    const claimedTransaction = {
      transaction_id: "txn_claimed_001",
      transaction_reference: "TXN-CLAIMED-001",
      status: "UNDER_REVIEW",
      assigned_to: currentUser.user_id,
      assigned_at: new Date().toISOString(),
    };

    return HttpResponse.json(claimedTransaction);
  }),

  // ============================================================================
  // Notes
  // ============================================================================

  http.get("/api/v1/transactions/:transactionId/notes", async ({ params }) => {
    await addDelay();
    const notes = [
      {
        note_id: "note_001",
        transaction_id: params.transactionId as string,
        note_type: "GENERAL",
        content: "This transaction looks suspicious",
        created_by: "user_maker_1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    return HttpResponse.json(notes);
  }),

  http.post("/api/v1/transactions/:transactionId/notes", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const newNote = {
      note_id: `note_${Date.now()}`,
      transaction_id: params.transactionId as string,
      note_type: body.note_type ?? "GENERAL",
      content: body.content,
      created_by: currentUser.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newNote, { status: 201 });
  }),

  http.put("/api/v1/transactions/:transactionId/notes/:noteId", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const updatedNote = {
      note_id: params.noteId as string,
      transaction_id: params.transactionId as string,
      note_type: body.note_type ?? "GENERAL",
      content: body.content,
      updated_by: currentUser.user_id,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(updatedNote);
  }),

  http.delete("/api/v1/transactions/:transactionId/notes/:noteId", async ({ params: _params }) => {
    await addDelay();
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  // ============================================================================
  // Review
  // ============================================================================

  http.get("/api/v1/transactions/:transactionId/review", async ({ params }) => {
    await addDelay();
    const review = {
      review_id: `review_${params.transactionId}`,
      transaction_id: params.transactionId as string,
      status: "PENDING_REVIEW",
      assigned_to: "user_maker_1",
      assigned_at: new Date().toISOString(),
      priority: 1,
      risk_level: "HIGH",
    };
    return HttpResponse.json(review);
  }),

  http.post("/api/v1/transactions/:transactionId/review", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    const review = {
      review_id: `review_${params.transactionId}`,
      transaction_id: params.transactionId as string,
      status: body.status ?? "PENDING_REVIEW",
      assigned_to: body.assigned_to ?? currentUser.user_id,
      assigned_at: new Date().toISOString(),
      priority: body.priority ?? 3,
      risk_level: body.risk_level ?? "MEDIUM",
    };
    return HttpResponse.json(review, { status: 201 });
  }),

  http.post("/api/v1/transactions/:transactionId/review/status", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    return HttpResponse.json({
      review_id: `review_${params.transactionId}`,
      transaction_id: params.transactionId as string,
      status: body.status,
      updated_at: new Date().toISOString(),
    });
  }),

  http.post("/api/v1/transactions/:transactionId/review/assign", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    return HttpResponse.json({
      review_id: `review_${params.transactionId}`,
      transaction_id: params.transactionId as string,
      assigned_to: body.assigned_to ?? currentUser.user_id,
      assigned_at: new Date().toISOString(),
    });
  }),

  http.post("/api/v1/transactions/:transactionId/review/resolve", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    return HttpResponse.json({
      review_id: `review_${params.transactionId}`,
      transaction_id: params.transactionId as string,
      status: "RESOLVED",
      resolution_code: body.resolution_code,
      resolution_notes: body.resolution_notes,
      resolved_at: new Date().toISOString(),
      resolved_by: currentUser.user_id,
    });
  }),

  http.post("/api/v1/transactions/:transactionId/review/escalate", async ({ params, request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    return HttpResponse.json({
      review_id: `review_${params.transactionId}`,
      transaction_id: params.transactionId as string,
      status: "ESCALATED",
      escalated_to: body.escalated_to,
      escalation_reason: body.escalation_reason,
      escalated_at: new Date().toISOString(),
    });
  }),

  // ============================================================================
  // Metrics
  // ============================================================================

  http.get("/api/v1/metrics", async () => {
    await addDelay();
    const metrics = {
      total_transactions: 1000,
      pending_review: 25,
      approved: 850,
      declined: 125,
      review_rate: 0.025,
    };
    return HttpResponse.json(metrics);
  }),

  http.get("/api/v1/metrics/workflow", async () => {
    await addDelay();
    const workflowMetrics = {
      avg_review_time: "45m",
      total_claimed_today: 15,
      total_resolved_today: 12,
      escalation_rate: 0.05,
    };
    return HttpResponse.json(workflowMetrics);
  }),

  http.get("/api/v1/metrics/cases", async () => {
    await addDelay();
    const caseMetrics = {
      total_cases: 50,
      open_cases: 20,
      in_progress_cases: 15,
      resolved_cases: 15,
      avg_resolution_time: "2d 4h",
    };
    return HttpResponse.json(caseMetrics);
  }),

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  http.post("/api/v1/bulk/assign", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    return HttpResponse.json({
      success: true,
      processed: body.transaction_ids?.length ?? 0,
      assigned_to: body.assigned_to,
    });
  }),

  http.post("/api/v1/bulk/status", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    return HttpResponse.json({
      success: true,
      processed: body.transaction_ids?.length ?? 0,
      status: body.status,
    });
  }),

  http.post("/api/v1/bulk/create-case", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    return HttpResponse.json({
      success: true,
      case_id: `case_bulk_${Date.now()}`,
      transaction_count: body.transaction_ids?.length ?? 0,
    });
  }),

  // ============================================================================
  // Field Registry
  // ============================================================================

  http.get("/api/v1/field-registry", async () => {
    await addDelay();
    const registry = {
      registry_version: 1,
      published_at: new Date().toISOString(),
      published_by: "admin",
      fields: ruleFieldStore.getAll(),
    };
    return HttpResponse.json(registry);
  }),

  http.get("/api/v1/field-registry/versions", async ({ request }) => {
    await addDelay();
    const url = new URL(request.url);
    const { cursor, limit, direction } = parseKeysetPagination(url);

    const versions = [
      {
        registry_version: 1,
        published_at: new Date().toISOString(),
        published_by: "admin",
        field_count: ruleFieldStore.getAll().length,
      },
    ];

    const result = keysetPaginate(versions, cursor, limit, direction, "registry_version");
    return HttpResponse.json({ ...result, limit });
  }),

  http.get("/api/v1/field-registry/versions/:registryVersion", async ({ params }) => {
    await addDelay();
    const registry = {
      registry_version: Number(params.registryVersion),
      published_at: new Date().toISOString(),
      published_by: "admin",
      fields: ruleFieldStore.getAll(),
    };
    return HttpResponse.json(registry);
  }),

  http.get(
    "/api/v1/field-registry/versions/:registryVersion/fields",
    async ({ params: _params, request }) => {
      await addDelay();
      const url = new URL(request.url);
      const { cursor, limit, direction } = parseKeysetPagination(url);

      const fields = ruleFieldStore.getAll();
      const result = keysetPaginate(fields, cursor, limit, direction, "field_key");
      return HttpResponse.json({ ...result, limit });
    }
  ),

  http.get("/api/v1/field-registry/next-field-id", async () => {
    await addDelay();
    const nextId = `field_${Date.now()}`;
    return HttpResponse.json({ next_field_id: nextId });
  }),

  // Backwards-compatibility: Some tests/components have been observed to request the
  // endpoint with a duplicated API prefix ("/api/v1/api/v1/..."). Add a permissive
  // handler to avoid unhandled request warnings while the root cause is investigated.
  http.get("/api/v1/api/v1/field-registry/next-field-id", async () => {
    await addDelay();
    const nextId = `field_${Date.now()}`;
    return HttpResponse.json({ next_field_id: nextId });
  }),

  http.post("/api/v1/field-registry/publish", async ({ request }) => {
    await addDelay();
    const body = (await request.json()) as any;
    return HttpResponse.json({
      registry_version: Date.now(),
      published_at: new Date().toISOString(),
      published_by: currentUser.user_id,
      changes_description: body.changes_description ?? "Published new registry version",
    });
  }),
];
