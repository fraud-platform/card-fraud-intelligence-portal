/**
 * Case Show Page
 *
 * Display case details with transactions and activity log.
 */

import type { ReactElement } from "react";
import CaseShowView from "./CaseShowView";
import { useParams } from "react-router";

export default function CaseShow(): ReactElement {
  const { id } = useParams<{ id: string }>();
  return <CaseShowView caseId={id} />;
}
