import { useEffect, useState } from "react";
import { get } from "../../api/httpClient";
import { CASES } from "../../api/endpoints";
import type { CaseTransaction } from "./types";

export function useCaseTransactions(caseId?: string): {
  transactions: CaseTransaction[];
  txnLoading: boolean;
} {
  const [transactions, setTransactions] = useState<CaseTransaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(true);

  useEffect(() => {
    if (caseId === undefined || caseId === "") {
      setTxnLoading(false);
      return;
    }

    const fetchTransactions = async (): Promise<void> => {
      try {
        const data = await get<{ items: CaseTransaction[] }>(CASES.TRANSACTIONS.LIST(caseId));
        setTransactions(data.items ?? []);
      } catch {
        setTransactions([]);
      } finally {
        setTxnLoading(false);
      }
    };

    void fetchTransactions();
  }, [caseId]);

  return { transactions, txnLoading };
}

export default useCaseTransactions;
