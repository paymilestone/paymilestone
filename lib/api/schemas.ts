// Generated Zod schemas from PayMilestone OpenAPI schema.
import { z } from 'zod';

export const ActionEnumSchema = z.enum(["approve", "request_revision"]);

export const AgreementApproveRequestRequestSchema = z.object({
  "version": z.number().int().min(1),
  "tx_hash": z.string().max(64).optional(),
});

export const AgreementRevisionSchema = z.object({
  "id": z.string().uuid(),
  "version": z.number().int(),
  "changed_by_wallet": z.string(),
  "change_summary": z.string(),
  "agreement_hash": z.string(),
  "snapshot": z.unknown(),
  "created_at": z.string(),
});

export const AgreementStatusEnumSchema = z.enum(["DRAFT", "AWAITING_APPROVAL", "APPROVED", "CANCELLED"]);

export const DashboardSummarySchema = z.object({
  "wallet": z.string(),
  "active_projects": z.number().int(),
  "pending_approvals": z.number().int(),
  "total_funded_milestones": z.number().int(),
  "completed_payments": z.number().int(),
  "open_disputes": z.number().int(),
  "unread_notifications": z.number().int(),
  "total_funded_amount": z.string(),
  "total_paid_amount": z.string(),
  "total_refunded_amount": z.string(),
  "remaining_escrow_balance": z.string(),
  "cached": z.boolean(),
});

export const DeliverableReviewRequestRequestSchema = z.object({
  "action": ActionEnumSchema,
  "review_comment": z.string().optional(),
  "tx_hash": z.string().max(64).optional(),
});

export const DeliverableSubmitRequestRequestSchema = z.object({
  "deliverable_url": z.string().url().min(1).max(1000),
  "evidence_reference": z.string().max(500).optional(),
  "notes": z.string().optional(),
  "tx_hash": z.string().max(64).optional(),
});

export const DisputeCreateRequestSchema = z.object({
  "milestone_id": z.string().uuid(),
  "reason": z.string().min(1),
  "evidence_url": z.union([z.string().url().max(1000), z.string().max(0)]).optional(),
  "tx_hash": z.string().max(64).optional(),
});

export const DisputeStatusEnumSchema = z.enum(["OPEN", "PROPOSAL_PENDING", "RESOLVED"]);

export const EventTypeEnumSchema = z.enum(["PROJECT_CREATED", "AGREEMENT_APPROVED", "MILESTONE_FUNDED", "DELIVERABLE_SUBMITTED", "MILESTONE_APPROVED", "PAYMENT_RELEASED", "MILESTONE_REFUNDED", "DISPUTE_OPENED", "DISPUTE_SETTLED"]);

export const FundingModelEnumSchema = z.enum(["INDIVIDUAL_MILESTONE", "FULL_UPFRONT"]);

export const HealthCheckResponseSchema = z.object({
  "status": z.string(),
  "database": z.string(),
  "cache": z.string(),
  "stellar_network": z.string(),
});

export const MilestoneFundRequestRequestSchema = z.object({
  "tx_hash": z.string().min(1).max(64),
  "amount": z.string().optional(),
  "ledger_sequence": z.number().int().min(1).nullable().optional(),
});

export const MilestoneInputRequestSchema = z.object({
  "sequence_number": z.number().int().min(1).max(50),
  "title": z.string().min(1).max(200),
  "description": z.string().min(1),
  "acceptance_criteria": z.string().min(1),
  "amount": z.string(),
  "deadline": z.string(),
});

export const MilestoneStatusEnumSchema = z.enum(["PENDING_FUNDING", "FUNDED", "IN_PROGRESS", "SUBMITTED_FOR_REVIEW", "REVISION_REQUESTED", "APPROVED_FOR_PAYMENT", "PAID", "DISPUTED", "REFUNDED"]);

export const MilestoneTxRequestRequestSchema = z.object({
  "tx_hash": z.string().min(1).max(64),
  "ledger_sequence": z.number().int().min(1).nullable().optional(),
});

export const NotificationTypeEnumSchema = z.enum(["AGREEMENT_INVITE", "AGREEMENT_APPROVED", "AGREEMENT_REVISED", "MILESTONE_FUNDED", "DELIVERABLE_SUBMITTED", "REVISION_REQUESTED", "MILESTONE_APPROVED", "PAYMENT_RELEASED", "MILESTONE_REFUNDED", "DISPUTE_OPENED", "DISPUTE_SETTLED", "DEADLINE_REMINDER"]);

export const PaginatedAgreementRevisionListSchema = z.object({
  "count": z.number().int(),
  "next": z.string().url().nullable().optional(),
  "previous": z.string().url().nullable().optional(),
  "results": z.array(AgreementRevisionSchema),
});

export const PatchedProjectUpdateRequestSchema = z.object({
  "title": z.string().min(1).max(200).optional(),
  "description": z.string().min(1).optional(),
  "total_budget": z.string().optional(),
  "start_date": z.string().optional(),
  "end_date": z.string().optional(),
  "funding_model": FundingModelEnumSchema.optional(),
  "onchain_project_id": z.number().int().min(1).nullable().optional(),
  "contract_address": z.string().max(56).optional(),
  "change_summary": z.string().max(500).optional(),
  "milestones": z.array(MilestoneInputRequestSchema).optional(),
});

export const ProjectCreateRequestSchema = z.object({
  "title": z.string().min(1).max(200),
  "description": z.string().min(1),
  "owner_wallet": z.string().min(1).max(56),
  "provider_wallet": z.string().min(1).max(56),
  "total_budget": z.string(),
  "currency": z.string().min(1).max(12).optional(),
  "start_date": z.string(),
  "end_date": z.string(),
  "funding_model": FundingModelEnumSchema.optional(),
  "onchain_project_id": z.number().int().min(1).nullable().optional(),
  "contract_address": z.string().max(56).optional(),
  "milestones": z.array(MilestoneInputRequestSchema),
});

export const ReviewStatusEnumSchema = z.enum(["PENDING", "APPROVED", "REVISION_REQUESTED"]);

export const SettlementApproveRequestSchema = z.object({
  "provider_amount": z.string(),
  "owner_refund": z.string(),
  "tx_hash": z.string().max(64).optional(),
});

export const SettlementProposalRequestSchema = z.object({
  "provider_amount": z.string(),
  "owner_refund": z.string(),
});

export const TransactionRecordSchema = z.object({
  "id": z.string().uuid(),
  "project": z.string().uuid().nullable().optional(),
  "milestone": z.string().uuid().nullable().optional(),
  "tx_hash": z.string().max(64),
  "event_type": EventTypeEnumSchema,
  "actor_wallet": z.string().max(56),
  "amount": z.string().nullable().optional(),
  "currency": z.string().max(12).optional(),
  "ledger_sequence": z.number().int().min(-9223372036854775808).max(9223372036854775807).nullable().optional(),
  "verified": z.boolean(),
  "raw_payload": z.unknown().optional(),
  "created_at": z.string(),
});

export const TransactionRecordRequestSchema = z.object({
  "project": z.string().uuid().nullable().optional(),
  "milestone": z.string().uuid().nullable().optional(),
  "tx_hash": z.string().min(1).max(64),
  "event_type": EventTypeEnumSchema,
  "actor_wallet": z.string().min(1).max(56),
  "amount": z.string().nullable().optional(),
  "currency": z.string().min(1).max(12).optional(),
  "ledger_sequence": z.number().int().min(-9223372036854775808).max(9223372036854775807).nullable().optional(),
  "raw_payload": z.unknown().optional(),
});

export const DeliverableSubmissionSchema = z.object({
  "id": z.string().uuid(),
  "milestone": z.string().uuid(),
  "submitted_by_wallet": z.string(),
  "deliverable_url": z.string().url(),
  "evidence_reference": z.string(),
  "evidence_hash": z.string(),
  "notes": z.string(),
  "review_status": ReviewStatusEnumSchema,
  "review_comment": z.string(),
  "reviewed_by_wallet": z.string(),
  "reviewed_at": z.string().nullable(),
  "created_at": z.string(),
});

export const DisputeSchema = z.object({
  "id": z.string().uuid(),
  "project_id": z.string().uuid(),
  "milestone": z.string().uuid(),
  "milestone_title": z.string(),
  "opened_by_wallet": z.string(),
  "reason": z.string(),
  "evidence_url": z.string().url(),
  "status": DisputeStatusEnumSchema,
  "proposed_provider_amount": z.string().nullable(),
  "proposed_owner_refund": z.string().nullable(),
  "proposed_by_wallet": z.string(),
  "owner_approved": z.boolean(),
  "provider_approved": z.boolean(),
  "resolution_tx_hash": z.string(),
  "resolved_at": z.string().nullable(),
  "created_at": z.string(),
  "updated_at": z.string(),
});

export const MilestoneSchema = z.object({
  "id": z.string().uuid(),
  "project": z.string().uuid(),
  "sequence_number": z.number().int().min(0).max(2147483647),
  "title": z.string().max(200),
  "description": z.string(),
  "acceptance_criteria": z.string(),
  "amount": z.string(),
  "funded_amount": z.string(),
  "released_amount": z.string(),
  "refunded_amount": z.string(),
  "available_escrow_balance": z.string(),
  "deadline": z.string(),
  "status": MilestoneStatusEnumSchema,
  "created_at": z.string(),
  "updated_at": z.string(),
});

export const NotificationSchema = z.object({
  "id": z.string().uuid(),
  "recipient_wallet": z.string(),
  "project": z.string().uuid().nullable(),
  "milestone": z.string().uuid().nullable(),
  "notification_type": NotificationTypeEnumSchema,
  "title": z.string(),
  "message": z.string(),
  "is_read": z.boolean(),
  "created_at": z.string(),
});

export const PaginatedDeliverableSubmissionListSchema = z.object({
  "count": z.number().int(),
  "next": z.string().url().nullable().optional(),
  "previous": z.string().url().nullable().optional(),
  "results": z.array(DeliverableSubmissionSchema),
});

export const PaginatedMilestoneListSchema = z.object({
  "count": z.number().int(),
  "next": z.string().url().nullable().optional(),
  "previous": z.string().url().nullable().optional(),
  "results": z.array(MilestoneSchema),
});

export const ProjectSchema = z.object({
  "id": z.string().uuid(),
  "onchain_project_id": z.number().int().min(-9223372036854775808).max(9223372036854775807).nullable().optional(),
  "title": z.string().max(200),
  "description": z.string(),
  "owner_wallet": z.string().max(56),
  "provider_wallet": z.string().max(56),
  "total_budget": z.string(),
  "currency": z.string().max(12).optional(),
  "start_date": z.string(),
  "end_date": z.string(),
  "funding_model": FundingModelEnumSchema.optional(),
  "agreement_status": AgreementStatusEnumSchema,
  "agreement_version": z.number().int(),
  "agreement_hash": z.string(),
  "owner_approved_version": z.number().int(),
  "provider_approved_version": z.number().int(),
  "is_mutually_approved": z.boolean(),
  "invite_token": z.string().uuid(),
  "contract_address": z.string().max(56).optional(),
  "total_funded": z.string(),
  "total_released": z.string(),
  "total_refunded": z.string(),
  "remaining_escrow_balance": z.string(),
  "milestones": z.array(MilestoneSchema),
  "created_at": z.string(),
  "updated_at": z.string(),
});

export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>;