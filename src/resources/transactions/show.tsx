/**
 * Transaction Detail
 *
 * Full transaction details with collapsible sections for fraud analyst review.
 * Shows transaction info, card info, merchant info, decision details, and matched rules.
 * Includes review workflow and analyst notes panels.
 */

import { useState, useEffect, useCallback, type FC, type ReactElement } from "react";
import { Alert, Card, Collapse, Col, Row, Spin, Tabs } from "antd";
import { Show } from "@refinedev/antd";
import { useGetIdentity, useNotification } from "@refinedev/core";
import { useParams } from "react-router";
import type { Transaction, MatchedRule, TransactionOverview } from "../../types/transaction";
import type {
  TransactionStatus,
  ResolutionCode,
  AnalystDecision,
  TransactionReview,
} from "../../types/review";
import type { NoteCreateRequest, NoteUpdateRequest, AnalystNote } from "../../types/notes";
import { get } from "../../api/httpClient";
import { TRANSACTIONS } from "../../api/endpoints";
import {
  TransactionDetailsPanel,
  CardInfoPanel,
  MerchantInfoPanel,
  DecisionDetailsPanel,
  MatchedRulesPanel,
  TransactionSidebar,
} from "./components";
import { useReview, useNotes } from "../../hooks";
import { NotesPanel } from "../../components/notes";

function createTransactionHandlers(
  updateStatus: ({ status }: { status: TransactionStatus }) => Promise<void>,
  assign: ({
    analyst_id,
    analyst_name,
  }: {
    analyst_id: string;
    analyst_name?: string;
  }) => Promise<void>,
  resolve: (params: {
    resolution_code: ResolutionCode;
    resolution_notes?: string;
    analyst_decision?: AnalystDecision;
    analyst_decision_reason?: string;
  }) => Promise<void>,
  escalate: ({
    escalation_reason,
    escalate_to,
  }: {
    escalation_reason: string;
    escalate_to?: string;
  }) => Promise<void>,
  createNote: (note: NoteCreateRequest) => Promise<void>,
  updateNote: (noteId: string, note: NoteUpdateRequest) => Promise<void>,
  deleteNote: (noteId: string) => Promise<void>
): {
  handleStatusChange: (status: TransactionStatus) => Promise<void>;
  handleAssign: (analystId: string, analystName?: string) => Promise<void>;
  handleResolve: (
    resolutionCode: ResolutionCode,
    resolutionNotes?: string,
    decision?: AnalystDecision,
    decisionReason?: string
  ) => Promise<void>;
  handleEscalate: (reason: string, escalateTo?: string) => Promise<void>;
  handleAddNote: (note: NoteCreateRequest) => Promise<void>;
  handleUpdateNote: (
    noteId: string,
    content: string,
    noteType?: NoteUpdateRequest["note_type"]
  ) => Promise<void>;
  handleDeleteNote: (noteId: string) => Promise<void>;
} {
  return {
    handleStatusChange: async (status: TransactionStatus) => {
      await updateStatus({ status });
    },
    handleAssign: async (analystId: string, analystName?: string) => {
      await assign({ analyst_id: analystId, analyst_name: analystName });
    },
    handleResolve: async (
      resolutionCode: ResolutionCode,
      resolutionNotes?: string,
      decision?: AnalystDecision,
      decisionReason?: string
    ) => {
      await resolve({
        resolution_code: resolutionCode,
        resolution_notes: resolutionNotes,
        analyst_decision: decision,
        analyst_decision_reason: decisionReason,
      });
    },
    handleEscalate: async (reason: string, escalateTo?: string) => {
      await escalate({ escalation_reason: reason, escalate_to: escalateTo });
    },
    handleAddNote: async (note: NoteCreateRequest) => {
      await createNote(note);
    },
    handleUpdateNote: async (
      noteId: string,
      content: string,
      noteType?: NoteUpdateRequest["note_type"]
    ) => {
      await updateNote(noteId, {
        note_content: content,
        note_type: noteType,
      });
    },
    handleDeleteNote: async (noteId: string) => {
      await deleteNote(noteId);
    },
  };
}

const { Panel } = Collapse;

interface TransactionShowContentProps {
  transactionId: string;
  transaction: Transaction;
  matchedRules: MatchedRule[];
  initialReview: TransactionReview | null;
  initialNotes: AnalystNote[];
}

const TransactionShowContent: FC<TransactionShowContentProps> = ({
  transactionId,
  transaction,
  matchedRules,
  initialReview,
  initialNotes,
}): ReactElement => {
  const { data: identity } = useGetIdentity<{ id: string; name: string }>();

  function renderDetailsPanels(transactionRecord: Transaction): ReactElement {
    return (
      <Collapse defaultActiveKey={["transaction", "decision"]}>
        <Panel header="Transaction Information" key="transaction">
          <TransactionDetailsPanel transaction={transactionRecord} />
        </Panel>

        <Panel header="Card Information" key="card">
          <CardInfoPanel transaction={transactionRecord} />
        </Panel>

        <Panel header="Merchant Information" key="merchant">
          <MerchantInfoPanel transaction={transactionRecord} />
        </Panel>

        <Panel header="Decision Details" key="decision">
          <DecisionDetailsPanel transaction={transactionRecord} />
        </Panel>
      </Collapse>
    );
  }

  const {
    review,
    isLoading: reviewLoading,
    updateStatus,
    assign,
    resolve,
    escalate,
    isUpdating,
  } = useReview({
    transactionId,
    enabled: transactionId !== "",
    initialReview,
    skipInitialFetch: true,
  });

  const {
    notes,
    isLoading: notesLoading,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes({
    transactionId,
    enabled: transactionId !== "",
    initialNotes,
    initialTotal: initialNotes.length,
    skipInitialFetch: true,
  });

  const {
    handleStatusChange,
    handleAssign,
    handleResolve,
    handleEscalate,
    handleAddNote,
    handleUpdateNote,
    handleDeleteNote,
  } = createTransactionHandlers(
    updateStatus,
    assign,
    resolve,
    escalate,
    createNote,
    updateNote,
    deleteNote
  );

  return (
    <Show>
      <Row gutter={16}>
        <Col span={16}>
          <Card size="small">
            <Tabs
              items={[
                {
                  key: "details",
                  label: "Details",
                  children: renderDetailsPanels(transaction),
                },
                {
                  key: "rules",
                  label: `Rule Matches (${matchedRules.length})`,
                  children: <MatchedRulesPanel matchedRules={matchedRules} />,
                },
                {
                  key: "notes",
                  label: `Notes (${notes.length})`,
                  children: (
                    <NotesPanel
                      notes={notes}
                      currentUserId={identity?.id}
                      onAddNote={handleAddNote}
                      onDeleteNote={handleDeleteNote}
                      onEditNote={(noteId, note) =>
                        handleUpdateNote(noteId, note.note_content ?? "", note.note_type)
                      }
                      loading={notesLoading}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={8}>
          <TransactionSidebar
            transactionId={transactionId}
            originalDecision={transaction.decision}
            review={review}
            reviewLoading={reviewLoading}
            isUpdating={isUpdating}
            onStatusChange={handleStatusChange}
            onAssign={handleAssign}
            onResolve={handleResolve}
            onEscalate={handleEscalate}
          />
        </Col>
      </Row>
    </Show>
  );
};

/**
 * Transaction Show Page
 */
export const TransactionShow: FC = (): ReactElement => {
  const params = useParams();
  const transactionId = params.id ?? "";
  const { open } = useNotification();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<TransactionOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (): Promise<void> => {
    if (transactionId === "") {
      setError("Transaction ID is required");
      setLoading(false);
      return;
    }

    try {
      const url = `${TRANSACTIONS.OVERVIEW(transactionId)}?include_rules=true`;
      const response = await get<TransactionOverview>(url);
      setOverview(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load transaction";
      setError(message);
      open?.({
        type: "error",
        message: "Error loading transaction",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [transactionId, open]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  if (loading) {
    return (
      <Card>
        <div className="centered-container">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error != null && error !== "") {
    return <Alert type="error" message="Error loading transaction" description={error} />;
  }

  if (overview?.transaction == null) {
    return <Alert type="warning" message="Transaction not found" />;
  }

  const matchedRules = overview.matched_rules ?? overview.transaction.matched_rules ?? [];

  return (
    <TransactionShowContent
      transactionId={transactionId}
      transaction={overview.transaction}
      matchedRules={matchedRules}
      initialReview={overview.review ?? null}
      initialNotes={overview.notes ?? []}
    />
  );
};

export default TransactionShow;
