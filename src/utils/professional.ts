import { BRAND } from "../config/brand.ts";
import type {
  CampaignObjective,
  ProfessionalCategory,
  ProfessionalPlanId,
  ProfessionalSettings,
  ProfessionalSubscription
} from "../types";

export const PROFESSIONAL_PLAN_OPTIONS: Array<{
  description: string;
  features: string[];
  id: ProfessionalPlanId;
  label: string;
  priceLabel: string;
}> = [
  {
    description: "Ferramentas profissionais e publicidade disponíveis para todos.",
    features: ["Métricas detalhadas", "Link profissional", "Gestão de campanhas"],
    id: "free",
    label: "Grátis",
    priceLabel: "R$ 0"
  },
  {
    description: "Assinatura dedicada ao selo de identidade verificada.",
    features: ["Identidade aprovada", "Selo no perfil", "Selo nas publicações"],
    id: "pro",
    label: BRAND.subscriptionName,
    priceLabel: "R$ 9,90/mês"
  }
];
export const PROFESSIONAL_CATEGORY_OPTIONS: Array<{
  id: ProfessionalCategory;
  label: string;
}> = [
  { id: "talent", label: "Talento" },
  { id: "creator", label: "Criador" },
  { id: "business", label: "Negócio" },
  { id: "brand", label: "Marca" },
  { id: "project", label: "Projeto" },
  { id: "service", label: "Serviço" }
];

export const CAMPAIGN_OBJECTIVE_OPTIONS: Array<{
  description: string;
  id: CampaignObjective;
  label: string;
}> = [
  {
    description: "Mostrar a publicação para mais pessoas.",
    id: "reach",
    label: "Mais alcance"
  },
  {
    description: "Levar pessoas interessadas ao seu perfil.",
    id: "profile_visits",
    label: "Visitas ao perfil"
  },
  {
    description: "Estimular conversas e pedidos de contato.",
    id: "messages",
    label: "Mais mensagens"
  }
];

export function createDefaultProfessionalSettings(): ProfessionalSettings {
  return {
    category: "talent",
    enabled: false,
    externalLink: "",
    plan: "free",
    updatedAt: new Date().toISOString()
  };
}

export function getProfessionalCategoryLabel(category: ProfessionalCategory) {
  return (
    PROFESSIONAL_CATEGORY_OPTIONS.find((option) => option.id === category)
      ?.label ?? "Profissional"
  );
}

export function getProfessionalPlanLabel(plan: ProfessionalPlanId) {
  return (
    PROFESSIONAL_PLAN_OPTIONS.find((option) => option.id === plan)?.label ??
    "Grátis"
  );
}

export function getCampaignObjectiveLabel(objective: CampaignObjective) {
  return (
    CAMPAIGN_OBJECTIVE_OPTIONS.find((option) => option.id === objective)?.label ??
    "Mais alcance"
  );
}

export function formatCompactMetric(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)} mi`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)} mil`;
  }

  return String(Math.round(value));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: "currency"
  }).format(value);
}
export function isProfessionalSubscriptionActive(
  subscription: ProfessionalSubscription | null
) {
  return subscription?.status === "authorized";
}

export function getProfessionalSubscriptionStatusLabel(
  subscription: ProfessionalSubscription | null
) {
  if (!subscription) return "Plano gratuito";
  if (subscription.status === "authorized") return "Assinatura ativa";
  if (subscription.status === "paused") return "Pagamento pendente";
  if (subscription.status === "canceled") return "Assinatura cancelada";
  return "Aguardando pagamento";
}

export function getProfessionalSubscriptionDetail(
  subscription: ProfessionalSubscription | null
) {
  if (!subscription) return "Sem cobrança ativa";

  if (subscription.status === "authorized" && subscription.nextPaymentAt) {
    const nextPaymentDate = new Date(subscription.nextPaymentAt);
    if (!Number.isNaN(nextPaymentDate.getTime())) {
      return "Próxima renovação em " + new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long"
      }).format(nextPaymentDate);
    }
  }

  if (subscription.status === "authorized") return "Renovação mensal ativa";
  if (subscription.status === "paused") return "Aguardando regularização do pagamento";
  if (subscription.status === "canceled") return "Não haverá nova cobrança";
  return "Finalize o pagamento no Mercado Pago";
}
