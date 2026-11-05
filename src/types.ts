import type { SubmissionMediaType } from "./features/posts/index";
import type { AuthenticatedUser } from "./features/auth/index";
import type { SocialUser } from "./features/profiles/index";
export type {
  PublicationMediaInput,
  Player,
  VideoSubmissionStatus,
  VideoSubmission,
  SubmissionMediaType,
} from "./features/posts/index";
export type { UserRole, AuthProvider, AuthenticatedUser } from "./features/auth/index";
export type { AccountProfile, SocialUser } from "./features/profiles/index";

export type ProfessionalPlanId = "free" | "pro" | "business";

export type ProfessionalSubscriptionStatus = "authorized" | "canceled" | "paused" | "pending";

export type ProfessionalSubscription = {
  authorizedAt?: string;
  canceledAt?: string;
  amount: number;
  checkoutUrl?: string;
  currency: "BRL";
  nextPaymentAt?: string;
  plan: "pro";
  provider: "mercado_pago";
  status: ProfessionalSubscriptionStatus;
  updatedAt: string;
};

export type IdentityVerificationStatus = "approved" | "expired" | "pending" | "rejected";

export type IdentityVerification = {
  provider?: string;
  reviewNote?: string;
  status: IdentityVerificationStatus;
  submittedAt?: string;
  updatedAt: string;
};

export type ProfessionalCategory =
  | "talent"
  | "creator"
  | "business"
  | "brand"
  | "project"
  | "service";

export type ProfessionalSettings = {
  category: ProfessionalCategory;
  enabled: boolean;
  externalLink: string;
  plan: ProfessionalPlanId;
  updatedAt: string;
};

export type ProfessionalSettingsByUser = Record<string, ProfessionalSettings>;

export type CampaignObjective = "reach" | "profile_visits" | "messages";

export type CampaignStatus = "active" | "paused" | "completed";

export type PromotionCampaign = {
  budget: number;
  clicks: number;
  createdAt: string;
  durationDays: number;
  estimatedReach: number;
  id: string;
  impressions: number;
  messages: number;
  objective: CampaignObjective;
  ownerUserId: string;
  playerId: string;
  profileId: string;
  status: CampaignStatus;
  title: string;
};

export type MessageContact = {
  id: string;
  profileId: string;
  name: string;
  subtitle: string;
  username?: string;
};

export type SharedPostReference = {
  authorName: string;
  caption?: string;
  mediaType: SubmissionMediaType;
  playerId: string;
  profileId: string;
  title: string;
};

export type AppNotificationKind = "comment" | "like" | "message" | "reply" | "shared-post";

export type AppNotification = {
  actorName: string;
  actorUserId: string;
  actorUsername: string;
  createdAt: string;
  id: string;
  kind: AppNotificationKind;
  mediaType?: SubmissionMediaType;
  playerId?: string;
  preview?: string;
  readAt?: string;
  recipientUserId: string;
  sourceId: string;
};

export type DirectMessage = {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  body: string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  sharedPost?: SharedPostReference;
};

export type PostComment = {
  authorName: string;
  authorProfileId: string;
  authorUserId: string;
  authorUsername: string;
  body: string;
  createdAt: string;
  id: string;
  parentCommentId?: string;
  playerId: string;
  replyToUserId?: string;
  replyToUsername?: string;
};

export type FollowingByUser = Record<string, string[]>;

export type HiddenPlayerIdsByUser = Record<string, string[]>;

export type SocialSelectionsByUser = Record<string, string[]>;

export type MessageContactsByUser = Record<string, MessageContact[]>;

export type ConversationPreferences = {
  deletedAtByContactId: Record<string, string>;
  mutedContactIds: string[];
  pinnedContactIds: string[];
};

export type ConversationPreferencesByUser = Record<string, ConversationPreferences>;

export type ProfileAvatar = {
  cropScale: number;
  focusX: number;
  focusY: number;
  sourceHeight?: number;
  sourceWidth?: number;
  uri: string;
};

export type ProfileAvatarsByProfile = Record<string, ProfileAvatar>;

export type TagCatalogEntry = {
  creatorCount: number;
  key: string;
  label: string;
  postCount: number;
};

// Fachada temporária: perfil social não exige credenciais fictícias.
export type AppUser =
  | AuthenticatedUser
  | (SocialUser & {
      email?: never;
      acceptedTerms?: never;
      authProvider?: never;
      googleUid?: never;
    });
