"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTransaction, listTransactions } from "@/lib/api/services/transactions";
import { queryKeys } from "@/lib/api/query-keys";
import type { TransactionRecordRequest, TransactionsListParams } from "@/lib/api/types";

export function useTransactionsQuery(params?: TransactionsListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params as Record<string, unknown> | undefined),
    queryFn: () => listTransactions(params),
    ...options,
  });
}

export function useCreateTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionRecordRequest) => createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
