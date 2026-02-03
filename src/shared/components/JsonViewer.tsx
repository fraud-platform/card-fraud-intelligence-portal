/**
 * JsonViewer Component
 *
 * Displays JSON data in a formatted, read-only view.
 * Used for displaying AST, condition trees, and audit data.
 */

import type { FC, CSSProperties } from "react";
import { Typography, Card } from "antd";
import { safeJsonStringify } from "../utils/json";
import "./json-viewer.css";

const { Paragraph } = Typography;

export interface JsonViewerProps {
  /** JSON data to display */
  data: unknown;
  /** Optional title */
  title?: string;
  /** Whether to show copy button */
  copyable?: boolean;
  /** Custom style */
  style?: CSSProperties;
  /** Maximum height (enables scrolling) */
  maxHeight?: number;
}

/**
 * JsonViewer component for displaying formatted JSON
 */
export const JsonViewer: FC<JsonViewerProps> = ({
  data,
  title,
  copyable = true,
  style: _style,
  maxHeight,
}) => {
  const jsonString = safeJsonStringify(data, true);

  const containerClass = typeof maxHeight === "number" ? `jsonviewer-max-${maxHeight}` : "";

  const content = (
    <Paragraph code copyable={copyable} className="jsonviewer-paragraph">
      {jsonString}
    </Paragraph>
  );

  if (title != null && title !== "") {
    return (
      <Card title={title} size="small" variant="outlined" className={containerClass}>
        {content}
      </Card>
    );
  }

  return <div className={containerClass}>{content}</div>;
};

export default JsonViewer;
