import { dataProvider } from "@/app/dataProvider";
import { httpClient } from "@/api/httpClient";
import type { GetListParams } from "@refinedev/core";

vi.mock("@/api/httpClient");

describe("dataProvider.getList shape handling", () => {
  const mockedRequest = httpClient.request as unknown as vi.Mock;

  afterEach(() => {
    mockedRequest.mockReset();
    vi.restoreAllMocks();
  });

  it("handles { items: [...] } shape", async () => {
    const items = [{ transaction_id: "t1" }, { transaction_id: "t2" }];
    mockedRequest.mockResolvedValue({ data: { items } });

    const params: GetListParams = {
      resource: "transactions",
      pagination: { pageSize: 10, current: 1 },
    } as any;
    const res = await dataProvider.getList(params);

    expect(res.data).toHaveLength(2);
    expect(res.total).toBe(2);
    expect(res.data[0]).toHaveProperty("id", "t1");
  });

  it("handles { data: [...] } shape", async () => {
    const data = [{ transaction_id: "t3" }];
    mockedRequest.mockResolvedValue({ data: { data } });

    const params: GetListParams = { resource: "transactions" } as any;
    const res = await dataProvider.getList(params);

    expect(res.data).toHaveLength(1);
    expect(res.data[0]).toHaveProperty("id", "t3");
  });

  it("handles { results: [...] } shape", async () => {
    const results = [{ transaction_id: "t4" }];
    mockedRequest.mockResolvedValue({ data: { results } });

    const params: GetListParams = { resource: "transactions" } as any;
    const res = await dataProvider.getList(params);

    expect(res.data).toHaveLength(1);
    expect(res.data[0]).toHaveProperty("id", "t4");
  });

  it("finds first array value under different key", async () => {
    const payload = { nested: [{ transaction_id: "t5" }], meta: { count: 1 } };
    mockedRequest.mockResolvedValue({ data: payload });

    const params: GetListParams = { resource: "transactions" } as any;
    const res = await dataProvider.getList(params);

    expect(res.data).toHaveLength(1);
    expect(res.data[0]).toHaveProperty("id", "t5");
  });

  it("handles plain array response", async () => {
    const arr = [{ transaction_id: "t6" }];
    mockedRequest.mockResolvedValue({ data: arr });

    const params: GetListParams = { resource: "transactions" } as any;
    const res = await dataProvider.getList(params);

    expect(res.data).toHaveLength(1);
    expect(res.data[0]).toHaveProperty("id", "t6");
  });

  it("returns empty result for unexpected shape and warns", async () => {
    const obj = { message: "no list here" };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockedRequest.mockResolvedValue({ data: obj });

    const params: GetListParams = { resource: "transactions" } as any;
    const res = await dataProvider.getList(params);

    expect(res.data).toHaveLength(0);
    expect(res.total).toBe(0);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[dataProvider] Unexpected list response"),
      expect.anything()
    );
    warn.mockRestore();
  });
});
