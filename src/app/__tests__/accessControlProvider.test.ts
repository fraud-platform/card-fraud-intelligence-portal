import { describe, it, expect, vi, beforeEach } from "vitest";
import { accessControlProvider, canPerformAction } from "../accessControlProvider";
import { authProvider } from "../authProvider";
import * as auth0 from "../auth0Client";

describe("accessControlProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("denies when no role is returned", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(null);
    const res = await accessControlProvider.can({ resource: "rules", action: "list" });
    expect(res.can).toBe(false);
  });

  it("denies when role is not in PERMISSIONS", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["UNKNOWN_ROLE"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    const res = await accessControlProvider.can({ resource: "rules", action: "list" });
    expect(res.can).toBe(false);
  });

  it("allows maker to create rules when Auth0 disabled", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    const res = await accessControlProvider.can({ resource: "rules", action: "create" });
    expect(res.can).toBe(true);
  });

  it("denies checker from creating rules", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    const res = await accessControlProvider.can({ resource: "rules", action: "create" });
    expect(res.can).toBe(false);
  });

  it("allows maker to list, show, edit, delete, and submit", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);

    const allowedActions = ["list", "show", "edit", "delete", "submit"];
    for (const action of allowedActions) {
      const res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(true);
    }
  });

  it("denies maker from approve and reject actions", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);

    const deniedActions = ["approve", "reject"];
    for (const action of deniedActions) {
      const res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(false);
      expect(res.reason).toContain(`cannot perform '${action}'`);
    }
  });

  it("allows checker to list and show", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);

    const allowedActions = ["list", "show"];
    for (const action of allowedActions) {
      const res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(true);
    }
  });

  it("denies checker from create, edit, delete, submit", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);

    const deniedActions = ["create", "edit", "delete", "submit"];
    for (const action of deniedActions) {
      const res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(false);
    }
  });

  it("allows checker to approve and reject", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);

    const allowedActions = ["approve", "reject"];
    for (const action of allowedActions) {
      const res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(true);
    }
  });

  it("approvals resource: approve only for checker", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    let res = await accessControlProvider.can({ resource: "approvals", action: "approve" });
    expect(res.can).toBe(true);

    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    res = await accessControlProvider.can({ resource: "approvals", action: "approve" });
    expect(res.can).toBe(false);
  });

  it("approvals resource: submit only for maker", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    let res = await accessControlProvider.can({ resource: "approvals", action: "submit" });
    expect(res.can).toBe(true);

    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    res = await accessControlProvider.can({ resource: "approvals", action: "submit" });
    expect(res.can).toBe(false);
  });

  it("denies edit when status is APPROVED", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    const res = await accessControlProvider.can({
      resource: "rules",
      action: "edit",
      params: { status: "APPROVED" },
    });
    expect(res.can).toBe(false);
    expect(res.reason).toContain("Cannot edit approved");
  });

  it("allows edit when status is not APPROVED", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    const res = await accessControlProvider.can({
      resource: "rules",
      action: "edit",
      params: { status: "DRAFT" },
    });
    expect(res.can).toBe(true);
  });

  it("enforces API scopes when Auth0 enabled", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(true as any);

    // Missing required scope
    vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue([] as any);
    const res = await accessControlProvider.can({ resource: "rules", action: "list" });
    expect(res.can).toBe(false);
    expect(res.reason).toContain("Missing API scope: read:rules");

    // When scopes include required scope
    vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue(["read:rules"] as any);
    const res2 = await accessControlProvider.can({ resource: "rules", action: "list" });
    expect(res2.can).toBe(true);
  });

  it("enforces write:rules scope for create, edit, delete, submit", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(true as any);

    const writeActions = ["create", "edit", "delete", "submit"];
    for (const action of writeActions) {
      // Missing scope
      vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue(["read:rules"] as any);
      let res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(false);
      expect(res.reason).toContain("Missing API scope: write:rules");

      // Has scope
      vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue([
        "read:rules",
        "write:rules",
      ] as any);
      res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(true);
    }
  });

  it("enforces approve:rules scope for approve/reject", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(true as any);

    const approveActions = ["approve", "reject"];
    for (const action of approveActions) {
      // Missing scope
      vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue(["read:rules"] as any);
      let res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(false);
      expect(res.reason).toContain("Missing API scope: approve:rules");

      // Has scope
      vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue([
        "read:rules",
        "approve:rules",
      ] as any);
      res = await accessControlProvider.can({ resource: "rules", action });
      expect(res.can).toBe(true);
    }
  });

  it("returns false when getAccessTokenScopes throws", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(true as any);
    vi.spyOn(auth0, "getAccessTokenScopes").mockRejectedValue(new Error("Token error"));

    const res = await accessControlProvider.can({ resource: "rules", action: "list" });
    expect(res.can).toBe(false);
  });

  it("returns false when getPermissions throws", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockRejectedValue(new Error("Auth error"));

    const res = await accessControlProvider.can({ resource: "rules", action: "list" });
    expect(res.can).toBe(false);
  });

  it("allows actions without required scope when no scope needed", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(true as any);
    vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue([] as any);

    // Actions on resources not requiring specific scopes
    const res = await accessControlProvider.can({ resource: "unknown-resource", action: "list" });
    expect(res.can).toBe(true);
  });

  it("handles approvals resource list action with scopes", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(true as any);

    vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue(["read:rules"] as any);
    const res = await accessControlProvider.can({ resource: "approvals", action: "list" });
    expect(res.can).toBe(true);
  });

  it("handles rule-fields and rulesets with scopes", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(true as any);

    const resources = ["rule-fields", "rulesets"];
    for (const resource of resources) {
      vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue(["read:rules"] as any);
      let res = await accessControlProvider.can({ resource, action: "list" });
      expect(res.can).toBe(true);

      vi.spyOn(auth0, "getAccessTokenScopes").mockResolvedValue([] as any);
      res = await accessControlProvider.can({ resource, action: "list" });
      expect(res.can).toBe(false);
    }
  });

  it("canPerformAction helper returns boolean", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_MAKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    const ok = await canPerformAction("create", "rules");
    expect(ok).toBe(true);
  });

  it("canPerformAction returns false for denied action", async () => {
    vi.spyOn(authProvider, "getPermissions" as any).mockResolvedValue(["RULE_CHECKER"] as any);
    vi.spyOn(auth0, "isAuth0Enabled").mockReturnValue(false as any);
    const ok = await canPerformAction("create", "rules");
    expect(ok).toBe(false);
  });

  it("has correct options configuration", () => {
    expect(accessControlProvider.options).toEqual({
      buttons: {
        enableAccessControl: true,
        hideIfUnauthorized: true,
      },
    });
  });
});
