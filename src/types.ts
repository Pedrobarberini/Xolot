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

export type SimulatedInvestmentStatus =
  | "Reserva simulada"
  | "KYC simulado"
  | "Contrato simulado"
  | "Pagamento simulado"
  | "Distribuicao simulada";

export type Investment = {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  simulatedMonthlyReturn: number;
  status: SimulatedInvestmentStatus;
  createdAt: string;
};

export type UserRole = "Investidor" | "Atleta" | "Admin";

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
