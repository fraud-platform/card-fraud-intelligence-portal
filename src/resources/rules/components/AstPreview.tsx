/**
 * AST Preview Component
 *
 * Displays the compiled AST/JSON representation of a rule or ruleset.
 * Read-only viewer for technical inspection.
 */

import type { FC } from "react";
import { Card } from "antd";
import { JsonViewer } from "../../../shared/components/JsonViewer";
import { PersistedConditionTree, CompiledAST } from "../../../types/domain";
import "./ast-preview.css";

export interface AstPreviewProps {
  /** AST data to display */
  ast: PersistedConditionTree | CompiledAST | null;
  /** Optional title */
  title?: string;
  /** Whether to show copy button */
  copyable?: boolean;
  /** Maximum height */
  maxHeight?: number;
}

/**
 * AstPreview component for displaying rule/ruleset AST
 */
export const AstPreview: FC<AstPreviewProps> = ({
  ast,
  title = "AST Preview",
  copyable = true,
  maxHeight = 400,
}) => {
  if (ast === null) {
    return (
      <Card title={title} size="small" variant="outlined">
        <div className="ast-empty">No AST available</div>
      </Card>
    );
  }

  return <JsonViewer data={ast} title={title} copyable={copyable} maxHeight={maxHeight} />;
};

export default AstPreview;
