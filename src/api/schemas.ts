import { z } from "zod";

/**
 * Risk Level Schema
 */
export const RiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

/**
 * Transaction Status Schema
 */
export const TransactionStatusSchema = z.enum([
  "PENDING",
  "IN_REVIEW",
  "ESCALATED",
  "RESOLVED",
  "CLOSED",
]);

/**
 * Rule Field Schema
 */
export const RuleFieldSchema = z.object({
  field_key: z.string(),
  display_name: z.string(),
  data_type: z.string(),
  description: z.string().optional(),
});

/**
 * Rule Schema
 */
export const RuleSchema = z.object({
  rule_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.string(),
  priority: z.number(),
});

/**
 * Ruleset Schema
 */
export const RulesetSchema = z.object({
  ruleset_id: z.string(),
  name: z.string(),
  version: z.number(),
  status: z.string(),
});

/**
 * Transaction Schema
 */
export const TransactionSchema = z.object({
  transaction_id: z.string(),
  amount: z.number(),
  currency: z.string(),
  card_last4: z.string().nullable().optional(),
  merchant_id: z.string().optional(),
  transaction_timestamp: z.string(),
  decision: z.string().optional(),
  risk_score: z.number().optional(),
});

/**
 * Worklist Item Schema
 */
export const WorklistItemSchema = z.object({
  review_id: z.string(),
  transaction_id: z.string(),
  status: TransactionStatusSchema,
  risk_level: RiskLevelSchema.nullable(),
  priority: z.number(),
  transaction_amount: z.number(),
  transaction_currency: z.string(),
});

/**
 * Map of resource names to their respective Zod schemas
 */
export const ResourceSchemas: Record<string, z.ZodTypeAny> = {
  "rule-fields": RuleFieldSchema,
  rules: RuleSchema,
  rulesets: RulesetSchema,
  transactions: TransactionSchema,
  worklist: WorklistItemSchema,
};
