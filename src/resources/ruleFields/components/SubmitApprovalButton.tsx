/**
 * Submit Approval Button Component
 *
 * Button for submitting field versions for approval in the maker-checker workflow (RULE_MAKER submits, RULE_CHECKER approves).
 * Shows confirmation dialog and handles API call to submit version.
 */

import { useState, type FC } from "react";
import { Button, Modal, Input, Space } from "antd";
import "./submit-approval-button.css";
import { SendOutlined } from "@ant-design/icons";
import { useInvalidate, useNotification } from "@refinedev/core";
import { fieldDefinitionsApi } from "../../../api/fieldDefinitions";

interface SubmitApprovalButtonProps {
  versionId: string;
  fieldKey?: string;
}

export const SubmitApprovalButton: FC<SubmitApprovalButtonProps> = ({ versionId, fieldKey }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const { open } = useNotification();
  const invalidate = useInvalidate();

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsLoading(true);

      await fieldDefinitionsApi.submitVersion(versionId, {
        // Explicitly handle empty/whitespace-only remarks and send trimmed value
        remarks: remarks.trim() !== "" ? remarks.trim() : undefined,
      });

      open?.({
        type: "success",
        message: "Submitted for Approval",
        description: "Field version has been submitted for checker approval.",
      });

      setIsModalOpen(false);
      setRemarks("");

      // Invalidate queries to refresh data
      void invalidate({
        resource: "rule-fields",
        invalidates: ["list", "detail"],
      });

      // Refresh the show page data
      if (fieldKey !== undefined && fieldKey !== "") {
        void invalidate({
          resource: "rule-fields",
          id: fieldKey,
          invalidates: ["detail"],
        });
      }
    } catch (error) {
      open?.({
        type: "error",
        message: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit for approval.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    setIsModalOpen(false);
    setRemarks("");
  };

  return (
    <>
      <Button
        type="primary"
        size="small"
        icon={<SendOutlined />}
        onClick={() => setIsModalOpen(true)}
        loading={isLoading}
      >
        Submit for Approval
      </Button>

      <Modal
        title="Submit Field Version for Approval"
        open={isModalOpen}
        onOk={() => {
          void handleSubmit();
        }}
        onCancel={handleCancel}
        confirmLoading={isLoading}
        okText="Submit"
        cancelText="Cancel"
        destroyOnHidden
      >
        <Space direction="vertical" size="middle" className="full-width">
          <div>
            Are you sure you want to submit this field version for approval? Once submitted, the
            version will be locked and cannot be edited until a checker approves or rejects it.
          </div>

          <div>
            <label htmlFor="approval-remarks" className="label-block">
              Remarks (optional)
            </label>
            <Input.TextArea
              id="approval-remarks"
              rows={3}
              placeholder="Add any notes for the reviewer..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default SubmitApprovalButton;
