import type {
  GroupNode,
  PredicateNode,
  ConditionNode,
  VelocityField,
  RuleField,
} from "../../../../types/domain";
import type { ValidationError } from "./validation";

export interface UiPredicateNode extends Omit<PredicateNode, "field" | "value"> {
  uiId: string;
  field: string | VelocityField;
  value: unknown;
  validationErrors?: ValidationError[];
}

export interface UiGroupNode extends Omit<GroupNode, "children"> {
  uiId: string;
  children: UiConditionNode[];
  validationErrors?: ValidationError[];
}

export type UiConditionNode = UiGroupNode | UiPredicateNode;

export type RuleFieldType = RuleField;
export type ConditionNodeType = ConditionNode;
