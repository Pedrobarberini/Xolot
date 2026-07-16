export type RiskLevel = "Baixo" | "Moderado" | "Alto";

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
  age: number;
  city: string;
  position: string;
  club: string;
  videoTitle: string;
  videoLength: string;
  videoUri: string | number;
  hasAudio?: boolean;
  isDemo?: boolean;
  highlight: string;
  objective: string;
  tags: string[];
  evaluation?: PlayerEvaluation;
};

export type AthleteFundStatus = "Captando" | "Concluida";

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
};

export type DirectMessage = {
  id: string;
  senderUserId: string;
  recipientUserId: string;
  body: string;
  createdAt: string;
};

export type FollowingByUser = Record<string, string[]>;

export type MessageContactsByUser = Record<string, MessageContact[]>;

export type ProfileAvatar = {
  cropScale: number;
  focusX: number;
  focusY: number;
  sourceHeight?: number;
  sourceWidth?: number;
  uri: string;
};

export type ProfileAvatarsByProfile = Record<string, ProfileAvatar>;

export type UserRole = "Usuario" | "Admin";

export type KycStatus = "Nao iniciado" | "Pendente" | "Aprovado";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kycStatus: KycStatus;
  acceptedTerms: boolean;
};

export type VideoSubmissionStatus =
  | "Em revisao"
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
  videoDurationMs?: number;
  videoFileName?: string;
  videoFileSize?: number;
  highlight: string;
  goals: string;
  hasGuardianConsent: boolean;
  status: VideoSubmissionStatus;
  submittedAt: string;
  reviewNote?: string;
  approvedAt?: string;
};
