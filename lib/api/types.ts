// Generated from PayMilestone OpenAPI schema (https://paymilestone.moggingbird.online/api/schema/).
// Covers all component schemas from the spec.

export type ActionEnum = "approve" | "request_revision";

export interface AgreementApproveRequestRequest {
  "version": number;
  "tx_hash"?: string;
}

export interface AgreementRevision {
  "id": string;
  "version": number;
  "changed_by_wallet": string;
  "change_summary": string;
  "agreement_hash": string;
  "snapshot": unknown;
  "created_at": string;
}

export type AgreementStatusEnum = "DRAFT" | "AWAITING_APPROVAL" | "APPROVED" | "CANCELLED";

export interface DashboardSummary {
  "wallet": string;
  "active_projects": number;
  "pending_approvals": number;
  "total_funded_milestones": number;
  "completed_payments": number;
  "open_disputes": number;
  "unread_notifications": number;
  "total_funded_amount": string;
  "total_paid_amount": string;
  "total_refunded_amount": string;
  "remaining_escrow_balance": string;
  "cached": boolean;
}

export interface DeliverableReviewRequestRequest {
  "action": ActionEnum;
  "review_comment"?: string;
  "tx_hash"?: string;
}

export interface DeliverableSubmitRequestRequest {
  "deliverable_url": string;
  "evidence_reference"?: string;
  "notes"?: string;
  "tx_hash"?: string;
}

export interface DisputeCreateRequest {
  "milestone_id": string;
  "reason": string;
  "evidence_url"?: string;
  "tx_hash"?: string;
}

export type DisputeStatusEnum = "OPEN" | "PROPOSAL_PENDING" | "RESOLVED";

export type EventTypeEnum = "PROJECT_CREATED" | "AGREEMENT_APPROVED" | "MILESTONE_FUNDED" | "DELIVERABLE_SUBMITTED" | "MILESTONE_APPROVED" | "PAYMENT_RELEASED" | "MILESTONE_REFUNDED" | "DISPUTE_OPENED" | "DISPUTE_SETTLED";

export type FundingModelEnum = "INDIVIDUAL_MILESTONE" | "FULL_UPFRONT";

export interface HealthCheckResponse {
  "status": string;
  "database": string;
  "cache": string;
  "stellar_network": string;
}

export interface MilestoneFundRequestRequest {
  "tx_hash": string;
  "amount"?: string;
  "ledger_sequence"?: (number | null);
}

export interface MilestoneInputRequest {
  "sequence_number": number;
  "title": string;
  "description": string;
  "acceptance_criteria": string;
  "amount": string;
  "deadline": string;
}

export type MilestoneStatusEnum = "PENDING_FUNDING" | "FUNDED" | "IN_PROGRESS" | "SUBMITTED_FOR_REVIEW" | "REVISION_REQUESTED" | "APPROVED_FOR_PAYMENT" | "PAID" | "DISPUTED" | "REFUNDED";

export interface MilestoneTxRequestRequest {
  "tx_hash": string;
  "ledger_sequence"?: (number | null);
}

export type NotificationTypeEnum = "AGREEMENT_INVITE" | "AGREEMENT_APPROVED" | "AGREEMENT_REVISED" | "MILESTONE_FUNDED" | "DELIVERABLE_SUBMITTED" | "REVISION_REQUESTED" | "MILESTONE_APPROVED" | "PAYMENT_RELEASED" | "MILESTONE_REFUNDED" | "DISPUTE_OPENED" | "DISPUTE_SETTLED" | "DEADLINE_REMINDER";

export interface PaginatedAgreementRevisionList {
  "count": number;
  "next"?: (string | null);
  "previous"?: (string | null);
  "results": AgreementRevision[];
}

export interface PatchedProjectUpdateRequest {
  "title"?: string;
  "description"?: string;
  "total_budget"?: string;
  "start_date"?: string;
  "end_date"?: string;
  "funding_model"?: FundingModelEnum;
  "onchain_project_id"?: (number | null);
  "contract_address"?: string;
  "change_summary"?: string;
  "milestones"?: MilestoneInputRequest[];
}

export interface ProjectCreateRequest {
  "title": string;
  "description": string;
  "owner_wallet": string;
  "provider_wallet": string;
  "total_budget": string;
  "currency"?: string;
  "start_date": string;
  "end_date": string;
  "funding_model"?: FundingModelEnum;
  "onchain_project_id"?: (number | null);
  "contract_address"?: string;
  "milestones": MilestoneInputRequest[];
}

export type ReviewStatusEnum = "PENDING" | "APPROVED" | "REVISION_REQUESTED";

export interface SettlementApproveRequest {
  "provider_amount": string;
  "owner_refund": string;
  "tx_hash"?: string;
}

export interface SettlementProposalRequest {
  "provider_amount": string;
  "owner_refund": string;
}

export interface TransactionRecord {
  "id": string;
  "project"?: (string | null);
  "milestone"?: (string | null);
  "tx_hash": string;
  "event_type": EventTypeEnum;
  "actor_wallet": string;
  "amount"?: (string | null);
  "currency"?: string;
  "ledger_sequence"?: (number | null);
  "verified": boolean;
  "raw_payload"?: unknown;
  "created_at": string;
}

export interface TransactionRecordRequest {
  "project"?: (string | null);
  "milestone"?: (string | null);
  "tx_hash": string;
  "event_type": EventTypeEnum;
  "actor_wallet": string;
  "amount"?: (string | null);
  "currency"?: string;
  "ledger_sequence"?: (number | null);
  "raw_payload"?: unknown;
}

export interface DeliverableSubmission {
  "id": string;
  "milestone": string;
  "submitted_by_wallet": string;
  "deliverable_url": string;
  "evidence_reference": string;
  "evidence_hash": string;
  "notes": string;
  "review_status": ReviewStatusEnum;
  "review_comment": string;
  "reviewed_by_wallet": string;
  "reviewed_at": (string | null);
  "created_at": string;
}

export interface Dispute {
  "id": string;
  "project_id": string;
  "milestone": string;
  "milestone_title": string;
  "opened_by_wallet": string;
  "reason": string;
  "evidence_url": string;
  "status": DisputeStatusEnum;
  "proposed_provider_amount": (string | null);
  "proposed_owner_refund": (string | null);
  "proposed_by_wallet": string;
  "owner_approved": boolean;
  "provider_approved": boolean;
  "resolution_tx_hash": string;
  "resolved_at": (string | null);
  "created_at": string;
  "updated_at": string;
}

export interface Milestone {
  "id": string;
  "project": string;
  "sequence_number": number;
  "title": string;
  "description": string;
  "acceptance_criteria": string;
  "amount": string;
  "funded_amount": string;
  "released_amount": string;
  "refunded_amount": string;
  "available_escrow_balance": string;
  "deadline": string;
  "status": MilestoneStatusEnum;
  "created_at": string;
  "updated_at": string;
}

export interface Notification {
  "id": string;
  "recipient_wallet": string;
  "project": (string | null);
  "milestone": (string | null);
  "notification_type": NotificationTypeEnum;
  "title": string;
  "message": string;
  "is_read": boolean;
  "created_at": string;
}

export interface PaginatedDeliverableSubmissionList {
  "count": number;
  "next"?: (string | null);
  "previous"?: (string | null);
  "results": DeliverableSubmission[];
}

export interface PaginatedMilestoneList {
  "count": number;
  "next"?: (string | null);
  "previous"?: (string | null);
  "results": Milestone[];
}

export interface Project {
  "id": string;
  "onchain_project_id"?: (number | null);
  "title": string;
  "description": string;
  "owner_wallet": string;
  "provider_wallet": string;
  "total_budget": string;
  "currency"?: string;
  "start_date": string;
  "end_date": string;
  "funding_model"?: FundingModelEnum;
  "agreement_status": AgreementStatusEnum;
  "agreement_version": number;
  "agreement_hash": string;
  "owner_approved_version": number;
  "provider_approved_version": number;
  "is_mutually_approved": boolean;
  "invite_token": string;
  "contract_address"?: string;
  "total_funded": string;
  "total_released": string;
  "total_refunded": string;
  "remaining_escrow_balance": string;
  "milestones": Milestone[];
  "created_at": string;
  "updated_at": string;
}

export interface ProjectsListParams { wallet?: string; role?: string; agreement_status?: string; search?: string; }
export interface TransactionsListParams { wallet?: string; project_id?: string; event_type?: string; }
export interface NotificationsListParams { wallet?: string; unread_only?: boolean; }
export interface DisputesListParams { project_id?: string; status?: string; wallet?: string; }
export interface PaginatedResponse<T> { count: number; next: string | null; previous: string | null; results: T[]; }
