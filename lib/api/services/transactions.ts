import { apiClient } from "@/lib/api/client";
import type { TransactionRecord, TransactionRecordRequest, TransactionsListParams } from "@/lib/api/types";

type TransactionsResponse =
  | TransactionRecord[]
  | { results?: TransactionRecord[]; count?: number; next?: string | null; previous?: string | null };

export async function listTransactions(params?: TransactionsListParams): Promise<TransactionRecord[]> {
  const { data } = await apiClient.get<TransactionsResponse>("/api/v1/transactions/", { params });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as { results?: TransactionRecord[] }).results)) {
    return (data as { results: TransactionRecord[] }).results;
  }
  return [];
}

export async function createTransaction(payload: TransactionRecordRequest): Promise<TransactionRecord> {
  const { data } = await apiClient.post<TransactionRecord>("/api/v1/transactions/", payload);
  return data;
}
