import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Descriptions, Table } from "../antdCompat";

describe("antdCompat", () => {
  it('maps Descriptions variant="outlined" to bordered', () => {
    const { container } = render(
      <Descriptions variant="outlined">
        <Descriptions.Item label="A">B</Descriptions.Item>
      </Descriptions>
    );

    expect(container.querySelector(".ant-descriptions-bordered")).toBeTruthy();
  });

  it('maps Table variant="outlined" to bordered', () => {
    const { container } = render(
      <Table variant="outlined" dataSource={[]} rowKey={(r: any) => r.id} pagination={false}>
        <Table.Column dataIndex="id" title="ID" />
      </Table>
    );

    expect(container.querySelector(".ant-table-bordered")).toBeTruthy();
  });

  it("does not set bordered when Descriptions variant is not provided", () => {
    const { container } = render(
      <Descriptions>
        <Descriptions.Item label="A">B</Descriptions.Item>
      </Descriptions>
    );

    expect(container.querySelector(".ant-descriptions-bordered")).toBeFalsy();
  });

  it("does not set bordered when Table variant is not provided", () => {
    const { container } = render(
      <Table dataSource={[]} rowKey={(r: any) => r.id} pagination={false}>
        <Table.Column dataIndex="id" title="ID" />
      </Table>
    );

    expect(container.querySelector(".ant-table-bordered")).toBeFalsy();
  });
});
