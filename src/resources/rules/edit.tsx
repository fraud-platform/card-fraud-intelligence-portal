/**
 * Rules Edit
 *
 * Form for editing rule drafts with condition builder.
 * Only accessible to makers. Approved rules cannot be edited.
 */

import { useState, useEffect, useMemo, type FC, type ReactElement } from "react";
import { Edit } from "@refinedev/antd";
import { useNotification, useNavigation } from "@refinedev/core";
import { Alert, Card, Form, InputNumber, Space, Typography, type FormInstance } from "antd";
import { Descriptions } from "../../shared/compat/antdCompat";
import { useParams } from "react-router";
import type { ConditionNode, Rule, RuleVersion } from "../../types/domain";
import { LogicalOperator, RuleStatus } from "../../types/enums";
import type { CreateRuleVersionRequest, RuleDetailResponse } from "../../api/types";
import { get, post } from "../../api/httpClient";
import { RULES } from "../../api/endpoints";
import {
  persistedTreeToConditionNode,
  conditionNodeToPersistedTree,
} from "../../shared/utils/conditionTree";
import { extractRuleAndVersion } from "../../shared/utils/ruleHelpers";
import { useEditAuthorization } from "../../shared/hooks/useEditAuthorization";
import { ConditionBuilder } from "./components/ConditionBuilder";
import { AstPreview } from "./components/AstPreview";
import { ScopeConfig } from "./components/ScopeConfig";
import "./rules.css";

type RuleDetailLike = RuleDetailResponse | (Rule & { version_details?: RuleVersion });

function RuleMeta({
  ruleObj,
  currentVersionObj,
  isImmutableFlag,
}: Readonly<{
  ruleObj: Rule | null;
  currentVersionObj?: RuleVersion | null;
  isImmutableFlag: boolean;
}>): ReactElement {
  return (
    <>
      <Descriptions size="small" column={1} variant="outlined">
        <Descriptions.Item label="Rule Name">{ruleObj?.rule_name ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Rule Type">{ruleObj?.rule_type ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Status">{ruleObj?.status ?? "-"}</Descriptions.Item>
        <Descriptions.Item label="Current Version">
          {ruleObj?.current_version ?? "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Priority">{currentVersionObj?.priority ?? "-"}</Descriptions.Item>
      </Descriptions>

      {isImmutableFlag && (
        <Typography.Text type="warning">
          Approved rules are immutable. Create a new draft rule instead.
        </Typography.Text>
      )}
    </>
  );
}

function RulePriorityForm({
  formRef,
  initialPriority,
  disabled,
}: Readonly<{
  formRef: FormInstance<{ priority: number }>;
  initialPriority: number;
  disabled: boolean;
}>): ReactElement {
  return (
    <Form form={formRef} layout="vertical" initialValues={{ priority: initialPriority }}>
      <Form.Item
        label="Priority"
        name="priority"
        rules={[{ required: true, message: "Priority is required" }]}
      >
        <InputNumber min={0} className="full-width" disabled={disabled} />
      </Form.Item>
    </Form>
  );
}

export const RuleEdit: FC = () => {
  const params = useParams();
  const ruleId = params.id;
  const { open } = useNotification();
  const { list, show } = useNavigation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rule, setRule] = useState<Rule | null>(null);
  const [currentVersion, setCurrentVersion] = useState<RuleVersion | null>(null);
  const [condition, setCondition] = useState<ConditionNode>({
    kind: "group",
    op: LogicalOperator.AND,
    children: [],
  });
  const [scope, setScope] = useState<RuleVersion["scope"] | null>(null);
  const [form] = Form.useForm<{ priority: number }>();

  // Authorization check
  const { canEdit } = useEditAuthorization({
    resource: "rules",
    params: { status: rule?.status },
  });

  function fetchAndHydrateRule(
    ruleIdArg: string,
    formRef: FormInstance<{ priority: number }>,
    setLoadingRef: (v: boolean) => void,
    setRuleRef: (r: Rule | null) => void,
    setCurrentVersionRef: (v: RuleVersion | null) => void,
    setConditionRef: (c: ConditionNode) => void,
    setScopeRef: (s: RuleVersion["scope"] | null) => void,
    openRef?: ReturnType<typeof useNotification>["open"]
  ): Promise<void> {
    return (async () => {
      if (ruleIdArg == null || ruleIdArg === "") return;
      setLoadingRef(true);
      try {
        const data = await get<RuleDetailLike>(RULES.GET(ruleIdArg));
        const extracted = extractRuleAndVersion(data);
        setRuleRef(extracted.rule);
        setCurrentVersionRef(extracted.currentVersion);
        if (extracted.currentVersion?.condition_tree != null) {
          setConditionRef(persistedTreeToConditionNode(extracted.currentVersion.condition_tree));
        }
        if (typeof extracted.currentVersion?.priority === "number") {
          formRef.setFieldsValue({ priority: extracted.currentVersion.priority });
        }
        setScopeRef(extracted.currentVersion?.scope ?? null);
      } catch (error) {
        openRef?.({
          type: "error",
          message: "Failed to load rule",
          description: (error as { message?: string }).message,
        });
      } finally {
        setLoadingRef(false);
      }
    })();
  }

  useEffect(() => {
    void fetchAndHydrateRule(
      ruleId ?? "",
      form,
      setLoading,
      setRule,
      setCurrentVersion,
      setCondition,
      setScope,
      open
    );

    return () => undefined;
  }, [form, open, ruleId]);

  const persistedTree = useMemo(() => conditionNodeToPersistedTree(condition), [condition]);

  const isImmutable = rule?.status === RuleStatus.APPROVED;

  // Show access denied if unauthorized
  if (!canEdit) {
    return (
      <Edit isLoading={loading} contentProps={{ variant: "outlined", size: "small" }}>
        <Alert
          message="Access Denied"
          description="You do not have permission to edit rules. Only makers can edit draft rules."
          type="error"
          showIcon
        />
      </Edit>
    );
  }

  const handleSave = async (): Promise<void> => {
    if (ruleId == null) return;
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: CreateRuleVersionRequest = {
        condition_tree: persistedTree,
        priority: values.priority,
        scope,
      };

      await post(RULES.VERSIONS.CREATE(ruleId), payload);

      open?.({
        type: "success",
        message: "New version created",
      });
      show("rules", ruleId);
    } catch (error) {
      open?.({
        type: "error",
        message: "Save failed",
        description: (error as { message?: string }).message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Edit
      isLoading={loading}
      contentProps={{ variant: "outlined", size: "small" }}
      saveButtonProps={{
        onClick: () => {
          void handleSave();
        },
        loading: saving,
        // Disable save while loading or when rule is immutable
        disabled: isImmutable || loading,
      }}
      headerButtons={
        <Space>
          <Typography.Link onClick={() => list("rules")}>Back to list</Typography.Link>
        </Space>
      }
    >
      <Space direction="vertical" className="full-width" size="small">
        <RuleMeta ruleObj={rule} currentVersionObj={currentVersion} isImmutableFlag={isImmutable} />

        <RulePriorityForm
          formRef={form}
          initialPriority={currentVersion?.priority ?? 100}
          disabled={isImmutable}
        />

        <ScopeConfig value={scope} onChange={setScope} disabled={isImmutable} />

        <Card title="Conditions" size="small" variant="outlined">
          <ConditionBuilder value={condition} onChange={setCondition} readOnly={isImmutable} />
        </Card>

        <AstPreview ast={persistedTree} title="Condition Tree Preview" />
      </Space>
    </Edit>
  );
};

export default RuleEdit;
