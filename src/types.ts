export type RiskLevel = "Baixo" | "Moderado" | "Alto";

export type SubmissionMediaType = "image" | "video";

export type PlayerMetric = {
  label: string;
  value: string;
};

export type PlayerEvaluation = {
  thesis: string;
  fundingGoal: number;
  funded: number;
  minimumTicket: number;
  athleteSharePercent: number;
  projectedMonthlyEarnings: number;
  score: number;
  riskLevel: RiskLevel;
  metrics: PlayerMetric[];
};

export type Player = {
  id: string;
  profileId: string;
  ownerUserId?: string;
  name: string;
  username?: string;
  age: number;
  city: string;
  position: string;
  club: string;
  videoTitle: string;
  videoLength: string;
  videoUri: string | number;
  mediaType?: SubmissionMediaType;
  hasAudio?: boolean;
  isDemo?: boolean;
  highlight: string;
  tags: string[];
  mentions?: string[];
  evaluation?: PlayerEvaluation;
};

export type AthleteFundStatus = "Captando" | "Concluída";

export type AthleteFund = {
  id: string;
  profileId: string;
  ownerUserId: string;
  athleteName: string;
  goalAmount: number;
  fundedAmount: number;
  minimumContribution: number;
  status: AthleteFundStatus;
  createdAt: string;
  completedAt?: string;
};

export type Investment = {
  id: string;
  fundId: string;
  investorUserId: string;
  profileId: string;
  playerName: string;
  amount: number;
  sharePercent: number;
  status: "Confirmada";
  createdAt: string;
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

export type DirectMessage = {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  body: string;
  createdAt: string;
  sharedPost?: SharedPostReference;
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

export type ConversationPreferencesByUser = Record<
  string,
  ConversationPreferences
>;

export type ProfileAvatar = {
  cropScale: number;
  focusX: number;
  focusY: number;
  sourceHeight?: number;
  sourceWidth?: number;
  uri: string;
};

export type ProfileAvatarsByProfile = Record<string, ProfileAvatar>;

export type UserRole = "Usuário" | "Admin";

export type KycStatus = "Não iniciado" | "Pendente" | "Aprovado";

export type AccountProfile = {
  age: number | null;
  bio: string;
  city: string;
  club: string;
  name: string;
  position: string;
  username: string;
};

export type AuthProvider = "password" | "google";

export type AppUser = AccountProfile & {
  id: string;
  email: string;
  role: UserRole;
  username: string;
  kycStatus: KycStatus;
  acceptedTerms: boolean;
  authProvider?: AuthProvider;
  googleUid?: string;
  photoURL?: string;
  passwordHash?: string;
  passwordSalt?: string;
  profileCompleted: boolean;
};

export type VideoSubmissionStatus =
  | "Em revisão"
  | "Ajustes solicitados"
  | "Aprovado"
  | "Reprovado";

export type VideoSubmission = {
  id: string;
  userId: string;
  athleteName: string;
  age: number;
  city: string;
  position: string;
  club: string;
  videoTitle: string;
  videoLink: string;
  mediaType?: SubmissionMediaType;
  videoDurationMs?: number;
  videoFileName?: string;
  videoFileSize?: number;
  highlight: string;
  tags?: string[];
  mentions?: string[];
  hasGuardianConsent: boolean;
  status: VideoSubmissionStatus;
  submittedAt: string;
  reviewNote?: string;
  approvedAt?: string;
};
