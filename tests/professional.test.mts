import assert from "node:assert/strict";
import test from "node:test";
import {
  PROFESSIONAL_PLAN_OPTIONS,
  createDefaultProfessionalSettings,
  formatCompactMetric,
  getCampaignObjectiveLabel,
  getProfessionalCategoryLabel,
  getProfessionalPlanLabel,
  getProfessionalSubscriptionDetail,
  getProfessionalSubscriptionStatusLabel,
  isProfessionalSubscriptionActive
} from "../src/utils/professional.ts";

test("cria configuração profissional gratuita e desativada por padrão", () => {
  const settings = createDefaultProfessionalSettings();
  assert.equal(settings.enabled, false);
  assert.equal(settings.plan, "free");
  assert.equal(settings.category, "talent");
});

test("mantém as ferramentas profissionais no plano gratuito", () => {
  const free = PROFESSIONAL_PLAN_OPTIONS.find((plan) => plan.id === "free");
  const plus = PROFESSIONAL_PLAN_OPTIONS.find((plan) => plan.id === "pro");
  assert.deepEqual(free?.features, [
    "Métricas detalhadas",
    "Link profissional",
    "Gestão de campanhas"
  ]);
  assert.equal(plus?.priceLabel, "R$ 9,90/mês");
  assert.deepEqual(plus?.features, [
    "Identidade aprovada",
    "Selo no perfil",
    "Selo nas publicações"
  ]);
});

test("formata métricas e rótulos do domínio profissional", () => {
  assert.equal(formatCompactMetric(900), "900");
  assert.equal(formatCompactMetric(1400), "1.4 mil");
  assert.equal(getProfessionalCategoryLabel("brand"), "Marca");
  assert.equal(getProfessionalPlanLabel("pro"), "Folko Plus");
  assert.equal(getCampaignObjectiveLabel("messages"), "Mais mensagens");
});

test("libera a assinatura somente quando autorizada pelo servidor", () => {
  const pending = {
    amount: 9.9,
    currency: "BRL" as const,
    plan: "pro" as const,
    provider: "mercado_pago" as const,
    status: "pending" as const,
    updatedAt: new Date().toISOString()
  };
  assert.equal(isProfessionalSubscriptionActive(null), false);
  assert.equal(isProfessionalSubscriptionActive(pending), false);
  assert.equal(
    isProfessionalSubscriptionActive({ ...pending, status: "authorized" }),
    true
  );
  assert.equal(
    getProfessionalSubscriptionStatusLabel(pending),
    "Aguardando pagamento"
  );
  assert.equal(
    getProfessionalSubscriptionDetail(pending),
    "Finalize o pagamento no Mercado Pago"
  );
  assert.equal(
    getProfessionalSubscriptionDetail({ ...pending, status: "canceled" }),
    "Não haverá nova cobrança"
  );
});
