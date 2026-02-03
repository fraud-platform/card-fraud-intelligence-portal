/**
 * Mock data generator for RuleFields
 */

import { RuleField, RuleFieldMetadata } from "../../types/domain";
import { DataType, Operator } from "../../types/enums";

/**
 * Generate mock RuleField data
 */
export const mockRuleFields: RuleField[] = [
  {
    field_key: "CARD_NUMBER",
    display_name: "Card Number (PAN)",
    data_type: DataType.STRING,
    allowed_operators: [Operator.EQ, Operator.NE, Operator.IN, Operator.NOT_IN],
    multi_value_allowed: true,
    is_sensitive: true,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "MERCHANT_ID",
    display_name: "Merchant ID",
    data_type: DataType.STRING,
    allowed_operators: [Operator.EQ, Operator.NE, Operator.IN, Operator.NOT_IN, Operator.LIKE],
    multi_value_allowed: true,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "AMOUNT",
    display_name: "Transaction Amount",
    data_type: DataType.NUMBER,
    allowed_operators: [
      Operator.EQ,
      Operator.NE,
      Operator.GT,
      Operator.GTE,
      Operator.LT,
      Operator.LTE,
      Operator.BETWEEN,
    ],
    multi_value_allowed: false,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "MCC",
    display_name: "Merchant Category Code",
    data_type: DataType.ENUM,
    allowed_operators: [Operator.EQ, Operator.NE, Operator.IN, Operator.NOT_IN],
    multi_value_allowed: true,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "COUNTRY",
    display_name: "Transaction Country",
    data_type: DataType.STRING,
    allowed_operators: [Operator.EQ, Operator.NE, Operator.IN, Operator.NOT_IN],
    multi_value_allowed: true,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "IS_CROSS_BORDER",
    display_name: "Cross-Border Transaction",
    data_type: DataType.BOOLEAN,
    allowed_operators: [Operator.EQ, Operator.NE],
    multi_value_allowed: false,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "TXN_TIME",
    display_name: "Transaction Timestamp",
    data_type: DataType.DATE,
    allowed_operators: [
      Operator.EQ,
      Operator.GT,
      Operator.GTE,
      Operator.LT,
      Operator.LTE,
      Operator.BETWEEN,
    ],
    multi_value_allowed: false,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "CARD_SCHEME",
    display_name: "Card Scheme",
    data_type: DataType.ENUM,
    allowed_operators: [Operator.EQ, Operator.NE, Operator.IN, Operator.NOT_IN],
    multi_value_allowed: true,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "CARDHOLDER_EMAIL",
    display_name: "Cardholder Email",
    data_type: DataType.STRING,
    allowed_operators: [
      Operator.EQ,
      Operator.NE,
      Operator.LIKE,
      Operator.NOT_LIKE,
      Operator.IS_NULL,
      Operator.IS_NOT_NULL,
    ],
    multi_value_allowed: false,
    is_sensitive: true,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "DEVICE_FINGERPRINT",
    display_name: "Device Fingerprint",
    data_type: DataType.STRING,
    allowed_operators: [
      Operator.EQ,
      Operator.NE,
      Operator.IN,
      Operator.NOT_IN,
      Operator.IS_NULL,
      Operator.IS_NOT_NULL,
    ],
    multi_value_allowed: true,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "IP_ADDRESS",
    display_name: "IP Address",
    data_type: DataType.STRING,
    allowed_operators: [Operator.EQ, Operator.NE, Operator.IN, Operator.NOT_IN, Operator.LIKE],
    multi_value_allowed: true,
    is_sensitive: true,
    is_active: true,
    created_at: "2024-01-16T10:00:00Z",
  },
  {
    field_key: "CARD_TYPE",
    display_name: "Card Type",
    data_type: DataType.ENUM,
    allowed_operators: [Operator.EQ, Operator.NE, Operator.IN, Operator.NOT_IN],
    multi_value_allowed: true,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-16T10:00:00Z",
  },
  {
    field_key: "MERCHANT_NAME",
    display_name: "Merchant Name",
    data_type: DataType.STRING,
    allowed_operators: [
      Operator.EQ,
      Operator.NE,
      Operator.LIKE,
      Operator.NOT_LIKE,
      Operator.IN,
      Operator.NOT_IN,
    ],
    multi_value_allowed: true,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-16T10:00:00Z",
  },
  {
    field_key: "AUTH_CODE",
    display_name: "Authorization Code",
    data_type: DataType.STRING,
    allowed_operators: [Operator.EQ, Operator.NE, Operator.IS_NULL, Operator.IS_NOT_NULL],
    multi_value_allowed: false,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-17T10:00:00Z",
  },
  {
    field_key: "RISK_SCORE",
    display_name: "Risk Score",
    data_type: DataType.NUMBER,
    allowed_operators: [
      Operator.EQ,
      Operator.GT,
      Operator.GTE,
      Operator.LT,
      Operator.LTE,
      Operator.BETWEEN,
    ],
    multi_value_allowed: false,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-17T10:00:00Z",
  },
];

/**
 * Generate mock RuleFieldMetadata
 */
export const mockRuleFieldMetadata: RuleFieldMetadata[] = [
  {
    field_key: "MCC",
    meta_key: "ui_group",
    meta_value: { group: "merchant", order: 1 },
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "MCC",
    meta_key: "validation_hint",
    meta_value: { hint: "Enter 4-digit Merchant Category Code" },
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "AMOUNT",
    meta_key: "ui_group",
    meta_value: { group: "transaction", order: 1 },
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "AMOUNT",
    meta_key: "velocity_config",
    meta_value: {
      aggregations: ["SUM", "COUNT"],
      windows: [
        { value: 5, unit: "MINUTES" },
        { value: 1, unit: "HOURS" },
        { value: 24, unit: "HOURS" },
      ],
    },
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "CARD_NUMBER",
    meta_key: "ui_group",
    meta_value: { group: "card", order: 1 },
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "CARD_SCHEME",
    meta_key: "enum_values",
    meta_value: { values: ["VISA", "MASTERCARD", "AMEX", "DISCOVER"] },
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    field_key: "CARD_TYPE",
    meta_key: "enum_values",
    meta_value: { values: ["CREDIT", "DEBIT", "PREPAID"] },
    created_at: "2024-01-15T10:00:00Z",
  },
];

/**
 * In-memory storage for RuleFields
 */
export class RuleFieldStore {
  private fields: Map<string, RuleField>;
  private metadata: Map<string, Map<string, RuleFieldMetadata>>;

  constructor() {
    this.fields = new Map(mockRuleFields.map((f) => [f.field_key, f]));
    this.metadata = new Map();

    // Initialize metadata
    mockRuleFieldMetadata.forEach((meta) => {
      if (!this.metadata.has(meta.field_key)) {
        this.metadata.set(meta.field_key, new Map());
      }
      this.metadata.get(meta.field_key)!.set(meta.meta_key, meta);
    });
  }

  getAll(): RuleField[] {
    return Array.from(this.fields.values());
  }

  getByKey(fieldKey: string): RuleField | undefined {
    return this.fields.get(fieldKey);
  }

  create(field: Omit<RuleField, "created_at">): RuleField {
    const newField: RuleField = {
      ...field,
      created_at: new Date().toISOString(),
    };
    this.fields.set(field.field_key, newField);
    return newField;
  }

  update(fieldKey: string, updates: Partial<RuleField>): RuleField | null {
    const existing = this.fields.get(fieldKey);
    if (!existing) return null;

    const updated = { ...existing, ...updates, field_key: fieldKey };
    this.fields.set(fieldKey, updated);
    return updated;
  }

  delete(fieldKey: string): boolean {
    return this.fields.delete(fieldKey);
  }

  getMetadata(fieldKey: string): RuleFieldMetadata[] {
    const metaMap = this.metadata.get(fieldKey);
    return metaMap ? Array.from(metaMap.values()) : [];
  }

  setMetadata(
    fieldKey: string,
    metaKey: string,
    metaValue: Record<string, unknown>
  ): RuleFieldMetadata {
    if (!this.metadata.has(fieldKey)) {
      this.metadata.set(fieldKey, new Map());
    }

    const meta: RuleFieldMetadata = {
      field_key: fieldKey,
      meta_key: metaKey,
      meta_value: metaValue,
      created_at: new Date().toISOString(),
    };
    this.metadata.get(fieldKey)!.set(metaKey, meta);
    return meta;
  }

  deleteMetadata(fieldKey: string, metaKey: string): boolean {
    const metaMap = this.metadata.get(fieldKey);
    return metaMap ? metaMap.delete(metaKey) : false;
  }
}
