/**
 * Scope Configuration Component
 *
 * Allows configuring network/bin/mcc/logo scope for rules.
 */

import { type FC, useState } from "react";
import { Card, Select, Space, Typography, Button, Tag } from "antd";
import "../rules.css";
import { DeleteOutlined } from "@ant-design/icons";
import type { RuleVersion } from "../../../types/domain";

interface ScopeConfigProps {
  value?: RuleVersion["scope"] | null;
  onChange?: (value: RuleVersion["scope"] | null) => void;
  disabled?: boolean;
}

interface ScopeOption {
  label: string;
  value: string;
  type: "network" | "bin" | "mcc" | "logo";
}

const mockNetworkOptions: ScopeOption[] = [
  { label: "Visa", value: "VISA", type: "network" },
  { label: "Mastercard", value: "MASTERCARD", type: "network" },
  { label: "Amex", value: "AMEX", type: "network" },
  { label: "Discover", value: "DISCOVER", type: "network" },
  { label: "UnionPay", value: "UNIONPAY", type: "network" },
  { label: "JCB", value: "JCB", type: "network" },
  { label: "Diners", value: "DINERS", type: "network" },
];

const mockBinOptions: ScopeOption[] = [
  { label: "4 - Visa Classic", value: "4", type: "bin" },
  { label: "5 - Mastercard", value: "5", type: "bin" },
  { label: "37 - Amex", value: "37", type: "bin" },
  { label: "6 - Discover", value: "6", type: "bin" },
  { label: "35 - JCB", value: "35", type: "bin" },
  { label: "30 - Diners", value: "30", type: "bin" },
];

const mockMccOptions: ScopeOption[] = [
  { label: "5411 - Grocery", value: "5411", type: "mcc" },
  { label: "5812 - Restaurants", value: "5812", type: "mcc" },
  { label: "5541 - Gas Stations", value: "5541", type: "mcc" },
  { label: "4111 - Transportation", value: "4111", type: "mcc" },
  { label: "5732 - Electronics", value: "5732", type: "mcc" },
  { label: "5967 - Direct Marketing", value: "5967", type: "mcc" },
  { label: "7995 - Gaming", value: "7995", type: "mcc" },
  { label: "5816 - Digital Goods", value: "5816", type: "mcc" },
];

const mockLogoOptions: ScopeOption[] = [
  { label: "Premium", value: "PREMIUM", type: "logo" },
  { label: "Standard", value: "STANDARD", type: "logo" },
  { label: "Classic", value: "CLASSIC", type: "logo" },
  { label: "Corporate", value: "CORPORATE", type: "logo" },
  { label: "Business", value: "BUSINESS", type: "logo" },
];

const scopeLabels: Record<string, string> = {
  network: "Network",
  bin: "BIN",
  mcc: "MCC",
  logo: "Logo",
};

interface ScopeTag {
  type: "network" | "bin" | "mcc" | "logo";
  value: string;
  label: string;
}

type ScopeType = "network" | "bin" | "mcc" | "logo";

function mapToTags(items: string[], options: ScopeOption[], type: ScopeType): ScopeTag[] {
  return items.map((v) => ({
    type,
    value: v,
    label: options.find((o) => o.value === v)?.label ?? v,
  }));
}

function buildScopeTags(
  selectedNetwork: string[],
  selectedBin: string[],
  selectedMcc: string[],
  selectedLogo: string[]
): ScopeTag[] {
  return [
    ...mapToTags(selectedNetwork, mockNetworkOptions, "network"),
    ...mapToTags(selectedBin, mockBinOptions, "bin"),
    ...mapToTags(selectedMcc, mockMccOptions, "mcc"),
    ...mapToTags(selectedLogo, mockLogoOptions, "logo"),
  ];
}

function buildNewScope(
  selectedNetwork: string[],
  selectedBin: string[],
  selectedMcc: string[],
  selectedLogo: string[]
): NonNullable<RuleVersion["scope"]> {
  return {
    network: selectedNetwork.length > 0 ? selectedNetwork : undefined,
    bin: selectedBin.length > 0 ? selectedBin : undefined,
    mcc: selectedMcc.length > 0 ? selectedMcc : undefined,
    logo: selectedLogo.length > 0 ? selectedLogo : undefined,
  };
}

interface MultiSelectFieldProps {
  placeholder: string;
  value: string[];
  onChange: (vals: string[]) => void;
  options: ScopeOption[];
  disabled?: boolean;
  onBlur?: () => void;
}

const MultiSelectField: FC<MultiSelectFieldProps> = ({
  placeholder,
  value,
  onChange,
  options,
  disabled = false,
  onBlur,
}) => (
  <Select
    mode="multiple"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    options={options}
    disabled={disabled}
    className="full-width"
    maxTagCount="responsive"
  />
);

const ScopeTagList: FC<{ tags: ScopeTag[] }> = ({ tags }) => (
  <Space wrap size="small">
    {tags.map((tag) => (
      <Tag key={`${tag.type}-${tag.value}`} color="blue">
        {scopeLabels[tag.type]}: {tag.label}
      </Tag>
    ))}
  </Space>
);

export const ScopeConfig: FC<ScopeConfigProps> = ({ value, onChange, disabled = false }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string[]>(value?.network ?? []);
  const [selectedBin, setSelectedBin] = useState<string[]>(value?.bin ?? []);
  const [selectedMcc, setSelectedMcc] = useState<string[]>(value?.mcc ?? []);
  const [selectedLogo, setSelectedLogo] = useState<string[]>(value?.logo ?? []);

  const handleUpdate = (): void => {
    const newScope = buildNewScope(selectedNetwork, selectedBin, selectedMcc, selectedLogo);
    const hasAnyScope =
      (newScope.network?.length ?? 0) > 0 ||
      (newScope.bin?.length ?? 0) > 0 ||
      (newScope.mcc?.length ?? 0) > 0 ||
      (newScope.logo?.length ?? 0) > 0;
    onChange?.(hasAnyScope ? newScope : null);
  };

  const handleClear = (): void => {
    setSelectedNetwork([]);
    setSelectedBin([]);
    setSelectedMcc([]);
    setSelectedLogo([]);
    onChange?.(null);
  };

  const hasSelection = [selectedNetwork, selectedBin, selectedMcc, selectedLogo].some(
    (a) => a.length > 0
  );

  const scopeTags = buildScopeTags(selectedNetwork, selectedBin, selectedMcc, selectedLogo);

  return (
    <Card
      title="Scope Configuration"
      size="small"
      variant="outlined"
      extra={
        hasSelection &&
        !disabled && (
          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={handleClear}>
            Clear
          </Button>
        )
      }
    >
      <Space direction="vertical" className="full-width" size="middle">
        <Typography.Text type="secondary">
          Configure scope dimensions to target specific card segments. Leave empty for country-wide
          rules.
        </Typography.Text>

        {hasSelection && <ScopeTagList tags={scopeTags} />}

        <MultiSelectField
          placeholder="Select networks"
          value={selectedNetwork}
          onChange={setSelectedNetwork}
          onBlur={handleUpdate}
          options={mockNetworkOptions}
          disabled={disabled}
        />

        <MultiSelectField
          placeholder="Select BINs (issuer)"
          value={selectedBin}
          onChange={setSelectedBin}
          onBlur={handleUpdate}
          options={mockBinOptions}
          disabled={disabled}
        />

        <MultiSelectField
          placeholder="Select MCCs (merchant category)"
          value={selectedMcc}
          onChange={setSelectedMcc}
          onBlur={handleUpdate}
          options={mockMccOptions}
          disabled={disabled}
        />

        <MultiSelectField
          placeholder="Select card logos/tiers"
          value={selectedLogo}
          onChange={setSelectedLogo}
          onBlur={handleUpdate}
          options={mockLogoOptions}
          disabled={disabled}
        />
      </Space>
    </Card>
  );
};

export default ScopeConfig;
