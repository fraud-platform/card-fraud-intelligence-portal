import React from "react";
import { Descriptions as AntdDescriptions, Table as AntdTable } from "antd";
import type { DescriptionsProps } from "antd/es/descriptions";
import type { TableProps } from "antd/es/table";

type Variant = "outlined";

interface DescriptionsPropsWithVariant extends DescriptionsProps {
  variant?: Variant;
}

interface TablePropsWithVariant<RecordType> extends TableProps<RecordType> {
  variant?: Variant;
}

type DescriptionsComponent = React.FC<DescriptionsPropsWithVariant> & {
  Item: typeof AntdDescriptions.Item;
};

const DescriptionsImpl: React.FC<DescriptionsPropsWithVariant> = (props) => {
  const { variant, ...rest } = props;
  const finalProps: DescriptionsProps = { ...rest };
  if (variant === "outlined") {
    (finalProps as { bordered?: boolean }).bordered = true;
  }
  return <AntdDescriptions {...finalProps} />;
};

// Attach static Item property
(DescriptionsImpl as DescriptionsComponent).Item = AntdDescriptions.Item;

export const Descriptions = DescriptionsImpl as DescriptionsComponent;

type TableComponent<RecordType> = (<RecordTypeInner = RecordType>(
  props: TablePropsWithVariant<RecordTypeInner>
) => React.ReactElement) & {
  Column: typeof AntdTable.Column;
  Summary: typeof AntdTable.Summary;
};

const TableImpl = <RecordType,>(props: TablePropsWithVariant<RecordType>): React.ReactElement => {
  const { variant, ...rest } = props;
  const finalProps: TableProps<RecordType> = { ...rest } as TableProps<RecordType>;
  if (variant === "outlined") {
    (finalProps as { bordered?: boolean }).bordered = true;
  }
  return <AntdTable<RecordType> {...finalProps} />;
};

// Attach static Column/Summary properties
(TableImpl as TableComponent<unknown>).Column = AntdTable.Column;
(TableImpl as TableComponent<unknown>).Summary = AntdTable.Summary;

export const Table = TableImpl as TableComponent<unknown>;

export default {
  Descriptions,
  Table,
};
