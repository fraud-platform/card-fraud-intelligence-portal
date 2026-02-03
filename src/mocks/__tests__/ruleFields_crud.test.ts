import { describe, it, expect } from "vitest";
import "../handlers";

// Global test setup handles MSW server lifecycle

describe("Rule Fields CRUD handlers", () => {
  it("creates, reads, updates, metadata, and deletes a rule field", async () => {
    const key = `tf_test_${Date.now()}`;

    // Create
    const createRes = await fetch("/api/v1/rule-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_key: key,
        display_name: "Test Field",
        data_type: "STRING",
        allowed_operators: ["EQ"],
      }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.field_key).toBe(key);

    // Get list filtered by data_type
    const listRes = await fetch(`/api/v1/rule-fields?data_type=STRING`);
    expect(listRes.ok).toBe(true);
    const listJson = await listRes.json();
    expect(Array.isArray(listJson.items)).toBe(true);
    expect(listJson.items.find((f: any) => f.field_key === key)).toBeDefined();

    // Get single
    const getRes = await fetch(`/api/v1/rule-fields/${key}`);
    expect(getRes.ok).toBe(true);
    const got = await getRes.json();
    expect(got.field_key).toBe(key);

    // Update
    const updRes = await fetch(`/api/v1/rule-fields/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: "Updated Name" }),
    });
    expect(updRes.ok).toBe(true);
    const updated = await updRes.json();
    expect(updated.display_name).toBe("Updated Name");

    // Metadata: add
    const metaRes = await fetch(`/api/v1/rule-fields/${key}/metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meta_key: "k1", meta_value: { foo: "bar" } }),
    });
    expect(metaRes.status).toBe(201);
    const meta = await metaRes.json();
    expect(meta.meta_key).toBe("k1");

    // Metadata get
    const getMeta = await fetch(`/api/v1/rule-fields/${key}/metadata`);
    expect(getMeta.ok).toBe(true);
    const metaList = await getMeta.json();
    expect(Array.isArray(metaList)).toBe(true);
    expect(metaList.find((m: any) => m.meta_key === "k1")).toBeDefined();

    // Delete metadata
    const delMeta = await fetch(`/api/v1/rule-fields/${key}/metadata/k1`, { method: "DELETE" });
    expect(delMeta.status).toBe(204);

    // Delete field
    const delRes = await fetch(`/api/v1/rule-fields/${key}`, { method: "DELETE" });
    expect([204, 200].includes(delRes.status)).toBe(true);
  }, 20000);
});
