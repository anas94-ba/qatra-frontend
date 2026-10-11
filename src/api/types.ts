/** Shapes returned by the Qatra API (kept in sync with the backend DTOs) */
export type Role = 'ADMIN' | 'ORG' | 'CAMP_REP';
export type Landing = 'EMAIL_VERIFY' | 'PENDING' | 'REJECTED' | 'DASHBOARD' | 'SUSPENDED';
export type EntityType = 'CAMP' | 'LOCAL_ORG' | 'INTERNATIONAL_ORG' | 'INITIATIVE';
export type OrgType = Exclude<EntityType, 'CAMP'>;
export type DeliveryStatus = 'PENDING' | 'CONFIRMED' | 'CONFIRMED_DIFF' | 'REJECTED' | 'CANCELLED';
export type PlanStatus = 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';

export interface PageMeta { total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean; hasPrev: boolean }
export interface Paginated<T> { items: T[]; meta: PageMeta }

export interface SessionUser {
  id: string; email: string; fullName: string; role: Role;
  campId: string | null; organizationId: string | null; mustChangePassword: boolean;
}
export interface Session {
  user: SessionUser;
  landing: Landing;
  landingData: Record<string, unknown> | null;
}
export interface LoginResponse extends Session { accessToken: string; refreshToken: string }

export interface PublicStats {
  camps: number;
  organizations: { total: number; byType: Record<OrgType, number> };
  confirmedLiters: number;
  pendingLiters: number;
  lastUpdate: string | null;
}
export interface MapCamp { id: string; name: string; region: string; lat: number; lng: number; plannedLiters: number; confirmedLiters: number; pendingLiters: number }
export interface PublicMap { month: string; camps: MapCamp[] }
export interface DonationInfo {
  available: boolean; message?: string; linkType?: 'WHATSAPP' | 'EXTERNAL_SITE'; url?: string;
  whatsappNumber?: string | null; receivingEntityName?: string; description?: string; warning?: string;
}
export interface PublicDonor { imageUrl: string; altText: string; order: number }

export interface RegistrationRequest {
  id: string; entityType: EntityType; name: string; region: string | null; lat: number | null; lng: number | null;
  contactName: string; email: string; phone: string; description: string | null; status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null; internalNote?: string | null; attemptCount: number; extraAttempts: number;
  details: Record<string, unknown>; rejectionHistory?: { attempt: number; reason: string; at: string }[];
  createdAt: string; attemptsRemaining?: number; canResubmit?: boolean;
  duplicates?: { kind: string; id: string; name: string; reason: string }[];
}

export interface Camp {
  id: string; name: string; region: string; lat: number; lng: number; status: 'ACTIVE' | 'SUSPENDED';
  publicVisible: boolean; suspendedReason: string | null;
}
export interface Organization {
  id: string; name: string; orgType: OrgType; contact: string | null; description: string | null;
  status: 'ACTIVE' | 'SUSPENDED'; suspendedReason: string | null;
}
export interface Snapshot {
  id: string; campId: string; families: number; population: number; children: number; disabled: number;
  waterReceivedLiters: number; lastDistributionAt: string | null; otherSources: string | null; reportedAt: string;
  source: string; reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED'; rejectionReason: string | null;
  camp?: { id: string; name: string; region: string };
}

export interface Plan {
  id: string; name: string; dailyLiters: number; startDate: string; endDate: string; status: PlanStatus;
  distributionDays: number[]; regions: string[]; _count?: { planCamps: number };
  planCamps?: { campId: string; camp: { id: string; name: string; region: string; status: string } }[];
  recommendations?: Recommendation[];
}
export interface Recommendation {
  id: string; planId: string; campId: string; score: number; suggestedLiters: number; algorithmVersion: number;
  reasons: { text: string; capLiters: number; currentLpcd: number; gapLpcd: number };
  warnings: string[]; camp?: { id: string; name: string; region: string };
  approval: { id: string; approvedLiters: number; adjustmentReason: string | null } | null;
}
export interface RecommendationsResponse {
  planId: string; dailyLiters: number; items: Recommendation[]; disclaimer: string;
  undistributed?: number; excludedSuspendedCamps?: string[];
}
export interface CoordinationRow { campId: string; campName: string; totalLiters: number; deliveries: { orgType: OrgType; liters: number; date: string }[] }

export interface Delivery {
  id: string; status: DeliveryStatus; frozen: boolean; sentLiters: number; receivedLiters: number | null; sentAt: string;
  executor: string; proofUrl: string | null; decisionNote: string | null; decidedAt: string | null; createdAt: string;
  from: { id: string; name: string; orgType: OrgType }; to: { id: string; name: string; region: string }; plan: { id: string; name: string } | null;
  warnings?: string[];
}
export interface AppNotification { id: string; type: string; title: string; body: string; deliveryId: string | null; createdAt: string; readAt: string | null }
export interface AlgorithmConfig { version: number; weights: { gap: number; vulnerability: number; daysSince: number; population: number }; referenceLpcd: number; isActive: boolean; createdAt: string }
export interface DonationLinkAdmin {
  id: string; linkType: 'WHATSAPP' | 'EXTERNAL_SITE'; url: string; whatsappNumber: string | null; receivingEntityName: string;
  description: string; isActive: boolean; lastVerifiedAt: string | null; lastStatus: string | null;
}
export interface Donor { id: string; imageUrl: string; altText: string; consentGivenAt: string; consentSource: string; displayOrder: number; isPublished: boolean }
export interface AuditEntry { id: string; userId: string | null; action: string; entity: string; entityId: string | null; before: unknown; after: unknown; createdAt: string }
