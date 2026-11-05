import { BRAND } from "../config/brand.ts";
import React, { useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  CircleX,
  Image as ImageIcon,
  Link2,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Sparkles
} from "lucide-react-native";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { BackButton } from "../components/Navigation";
import { professionalStyles as s } from "../styles/professionalStyles";
import { colors } from "../theme";
import type {
  IdentityVerification,
  Player,
  ProfessionalSettings,
  ProfessionalSubscription,
  PromotionCampaign
} from "../types";
import {
  PROFESSIONAL_CATEGORY_OPTIONS,
  formatCompactMetric,
  getProfessionalCategoryLabel,
  getProfessionalSubscriptionDetail,
  getProfessionalSubscriptionStatusLabel,
  isProfessionalSubscriptionActive
} from "../utils/professional";

export function ProfessionalDashboardScreen({
  identityVerification,
  metrics,
  onBack,
  onCancelSubscription,
  onOpenIdentityVerification,
  onPromotePost,
  onStartSubscription,
  onSyncSubscription,
  onUpdateSettings,
  posts,
  settings,
  subscription,
  subscriptionLoading
}: {
  campaigns: PromotionCampaign[];
  identityVerification: IdentityVerification | null;
  metrics: {
    likes: number;
    messages: number;
    posts: number;
    views: number;
  };
  onBack: () => void;
  onCancelSubscription: () => Promise<void>;
  onOpenIdentityVerification: () => void;
  onPromotePost: (player: Player) => void;
  onStartSubscription: () => Promise<void>;
  onSyncSubscription: () => Promise<void>;
  onToggleCampaign: (campaignId: string) => void;
  onUpdateSettings: (settings: ProfessionalSettings) => void;
  posts: Player[];
  settings: ProfessionalSettings;
  subscription: ProfessionalSubscription | null;
  subscriptionLoading: boolean;
}) {
  const [externalLink, setExternalLink] = useState(settings.externalLink);
  const [isCheckoutConfirmationVisible, setIsCheckoutConfirmationVisible] =
    useState(false);
  const [isCancelConfirmationVisible, setIsCancelConfirmationVisible] =
    useState(false);
  const [subscriptionAction, setSubscriptionAction] = useState<
    "cancel" | "checkout" | "sync" | null
  >(null);
  const isSubscriptionActive = isProfessionalSubscriptionActive(subscription);
  const isIdentityApproved = identityVerification?.status === "approved";
  const hasVerifiedBadge = isSubscriptionActive && isIdentityApproved;

  function updateSettings(update: Partial<ProfessionalSettings>) {
    onUpdateSettings({
      ...settings,
      ...update,
      plan: isSubscriptionActive ? "pro" : "free",
      updatedAt: new Date().toISOString()
    });
  }

  function saveExternalLink() {
    updateSettings({ externalLink: externalLink.trim() });
  }

  async function startSubscription() {
    if (subscriptionAction || isSubscriptionActive || !isIdentityApproved) return;
    setIsCheckoutConfirmationVisible(false);
    setSubscriptionAction("checkout");
    try {
      await onStartSubscription();
    } finally {
      setSubscriptionAction(null);
    }
  }

  async function syncSubscription() {
    if (subscriptionAction) return;
    setSubscriptionAction("sync");
    try {
      await onSyncSubscription();
    } finally {
      setSubscriptionAction(null);
    }
  }

  async function cancelSubscription() {
    if (subscriptionAction || !isSubscriptionActive) return;
    setIsCancelConfirmationVisible(false);
    setSubscriptionAction("cancel");
    try {
      await onCancelSubscription();
    } finally {
      setSubscriptionAction(null);
    }
  }

  function handlePlusAction() {
    if (!isIdentityApproved) {
      onOpenIdentityVerification();
      return;
    }
    setIsCheckoutConfirmationVisible(true);
  }

  return (
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <BackButton accessibilityLabel="Voltar ao perfil" onPress={onBack} />
        <Text style={s.headerTitle}>Painel profissional</Text>
        <View style={s.headerSpacer} />
      </View>

      <View style={s.hero}>
        <Text style={s.heroEyebrow}>Crescimento e publicidade</Text>
        <Text style={s.heroTitle}>Ferramentas profissionais para todos</Text>
        <Text style={s.heroDescription}>
          Métricas, categoria, link e campanhas não dependem de assinatura. O
          Plus existe somente para o selo de identidade verificada.
        </Text>
        <View style={s.switchRow}>
          <View style={s.switchText}>
            <Text style={[s.optionTitle, { color: colors.onPrimary }]}>Modo profissional</Text>
            <Text style={[s.optionDescription, { color: "rgba(255,255,255,0.72)" }]}>
              Categoria atual: {getProfessionalCategoryLabel(settings.category)}
            </Text>
          </View>
          <Switch
            onValueChange={(enabled) => updateSettings({ enabled })}
            thumbColor={colors.surface}
            trackColor={{ false: "rgba(255,255,255,0.24)", true: colors.accent }}
            value={settings.enabled}
          />
        </View>
      </View>

      <View style={s.section}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Visão geral</Text>
            <Text style={s.sectionDescription}>Desempenho real do conteúdo publicado.</Text>
          </View>
          <BarChart3 color={colors.primaryText} size={22} />
        </View>
        <View style={s.metricGrid}>
          <Metric label="visualizações" value={formatCompactMetric(metrics.views)} />
          <Metric label="curtidas" value={formatCompactMetric(metrics.likes)} />
          <Metric label="mensagens" value={formatCompactMetric(metrics.messages)} />
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Perfil profissional</Text>
        <Text style={s.sectionDescription}>
          Defina sua categoria e um link de contato sem custo.
        </Text>
        <View style={s.categoryGrid}>
          {PROFESSIONAL_CATEGORY_OPTIONS.map((option) => {
            const active = option.id === settings.category;
            return (
              <Pressable
                accessibilityRole="button"
                key={option.id}
                onPress={() => updateSettings({ category: option.id })}
                style={[s.categoryOption, active ? s.categoryOptionActive : null]}
              >
                <Text style={[s.categoryOptionText, active ? s.categoryOptionTextActive : null]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[s.label, { marginTop: 18 }]}>Link profissional</Text>
        <View style={s.inputWithIcon}>
          <Link2 color={colors.primaryText} size={18} />
          <TextInput
            autoCapitalize="none"
            keyboardType="url"
            onBlur={saveExternalLink}
            onChangeText={setExternalLink}
            onSubmitEditing={saveExternalLink}
            placeholder="https://seusite.com.br"
            placeholderTextColor={colors.muted}
            style={s.inputFlex}
            value={externalLink}
          />
        </View>
      </View>

      <View style={s.section}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>{BRAND.subscriptionName}</Text>
            <Text style={s.sectionDescription}>
              {subscriptionLoading
                ? "Consultando assinatura..."
                : getProfessionalSubscriptionStatusLabel(subscription)}
            </Text>
          </View>
          {hasVerifiedBadge ? (
            <BadgeCheck color={colors.primaryText} size={26} />
          ) : (
            <Sparkles color={colors.primaryText} size={24} />
          )}
        </View>

        <View style={[s.planCard, hasVerifiedBadge ? s.planCardActive : null]}>
          <View style={s.optionHeader}>
            <Text style={s.optionTitle}>Selo de identidade verificada</Text>
            <Text style={s.planPrice}>R$ 9,90/mês</Text>
          </View>
          <Text style={s.optionDescription}>
            O Plus não bloqueia ferramentas. Ele confirma que a identidade do
            titular foi aprovada e mantém o selo enquanto a assinatura estiver ativa.
          </Text>
          <View style={{ marginTop: 9 }}>
            <Text style={s.planFeature}>• Identidade aprovada antes do pagamento</Text>
            <Text style={s.planFeature}>• Selo público no perfil e nas publicações</Text>
            <Text style={s.planFeature}>• Cancelamento a qualquer momento</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={Boolean(subscriptionAction) || hasVerifiedBadge}
            onPress={handlePlusAction}
            style={[
              s.actionButton,
              s.planAction,
              subscriptionAction || hasVerifiedBadge ? s.actionButtonDisabled : null
            ]}
          >
            <ShieldCheck color={colors.onPrimary} size={18} />
            <Text style={s.actionButtonText}>
              {hasVerifiedBadge
                ? "Selo verificado ativo"
                : !isIdentityApproved
                  ? identityVerification?.status === "pending"
                    ? "Acompanhar verificação"
                    : "Verificar identidade"
                  : subscription?.status === "pending"
                    ? "Continuar pagamento"
                    : "Assinar selo verificado"}
            </Text>
          </Pressable>
        </View>

        {subscription ? (
          <Text style={s.subscriptionDetail}>
            {getProfessionalSubscriptionDetail(subscription)}
          </Text>
        ) : null}

        {subscription?.status === "pending" || subscription?.status === "paused" ? (
          <Pressable
            accessibilityRole="button"
            disabled={Boolean(subscriptionAction)}
            onPress={() => void syncSubscription()}
            style={s.secondaryAction}
          >
            {subscriptionAction === "sync" ? (
              <ActivityIndicator color={colors.primaryText} size="small" />
            ) : (
              <RefreshCw color={colors.primaryText} size={17} />
            )}
            <Text style={s.secondaryActionText}>Atualizar status do pagamento</Text>
          </Pressable>
        ) : null}

        {isSubscriptionActive ? (
          <Pressable
            accessibilityRole="button"
            disabled={Boolean(subscriptionAction)}
            onPress={() => setIsCancelConfirmationVisible(true)}
            style={[s.secondaryAction, s.cancelAction]}
          >
            <CircleX color={colors.danger} size={17} />
            <Text style={[s.secondaryActionText, s.cancelActionText]}>
              Cancelar assinatura
            </Text>
          </Pressable>
        ) : null}

        <View style={[s.notice, { marginTop: 12 }]}>
          <Text style={s.noticeText}>
            A cobrança mensal de R$ 9,90 é processada pelo Mercado Pago. A {BRAND.name}
            não recebe nem armazena os dados do cartão.
          </Text>
        </View>
      </View>

      <View style={s.section}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Promover publicação</Text>
            <Text style={s.sectionDescription}>
              O impulsionamento será cobrado por campanha, sem exigir o Plus.
            </Text>
          </View>
          <Megaphone color={colors.primaryText} size={22} />
        </View>
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <Pressable
              key={post.id}
              onPress={() => onPromotePost(post)}
              style={[s.postItem, index === 0 ? s.postItemFirst : null]}
            >
              <View style={s.postMediaIcon}>
                <ImageIcon color={colors.primaryText} size={20} />
              </View>
              <View style={s.postText}>
                <Text numberOfLines={1} style={s.postTitle}>{post.videoTitle}</Text>
                <Text style={s.postType}>Configurar impulsionamento</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={[s.emptyState, { marginTop: 12 }]}>
            <Megaphone color={colors.muted} size={28} />
            <Text style={s.emptyTitle}>Nenhuma publicação disponível</Text>
            <Text style={s.emptyBody}>Publique conteúdo para preparar uma campanha.</Text>
          </View>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Campanhas</Text>
        <Text style={s.sectionDescription}>
          Somente campanhas pagas e confirmadas pelo backend aparecerão aqui.
        </Text>
        <View style={[s.emptyState, { marginTop: 12 }]}>
          <Megaphone color={colors.muted} size={28} />
          <Text style={s.emptyTitle}>Nenhuma campanha ativa</Text>
          <Text style={s.emptyBody}>
            Alcance estimado e campanhas simuladas não serão exibidos como dados reais.
          </Text>
        </View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsCheckoutConfirmationVisible(false)}
        transparent
        visible={isCheckoutConfirmationVisible}
      >
        <Pressable onPress={() => setIsCheckoutConfirmationVisible(false)} style={s.modalBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={s.modalCard}>
            <Text style={s.modalTitle}>
              {subscription?.status === "pending" ? "Continuar assinatura?" : `Assinar ${BRAND.subscriptionName}?`}
            </Text>
            <Text style={s.checkoutPrice}>R$ 9,90 por mês</Text>
            <Text style={s.modalBody}>
              Sua identidade já foi aprovada. A cobrança recorrente mantém apenas
              o selo verificado e pode ser cancelada quando quiser.
            </Text>
            <View style={s.checkoutSummary}>
              <Text style={s.checkoutSummaryItem}>• Identidade aprovada</Text>
              <Text style={s.checkoutSummaryItem}>• Selo ativo durante a assinatura</Text>
              <Text style={s.checkoutSummaryItem}>• Ferramentas profissionais continuam gratuitas</Text>
            </View>
            <View style={s.modalActions}>
              <Pressable
                disabled={Boolean(subscriptionAction)}
                onPress={() => setIsCheckoutConfirmationVisible(false)}
                style={s.modalSecondaryButton}
              >
                <Text style={s.modalSecondaryButtonText}>Agora não</Text>
              </Pressable>
              <Pressable
                disabled={Boolean(subscriptionAction)}
                onPress={() => void startSubscription()}
                style={s.modalPrimaryButton}
              >
                {subscriptionAction === "checkout" ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text style={s.modalPrimaryButtonText}>Continuar</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsCancelConfirmationVisible(false)}
        transparent
        visible={isCancelConfirmationVisible}
      >
        <Pressable onPress={() => setIsCancelConfirmationVisible(false)} style={s.modalBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={s.modalCard}>
            <Text style={s.modalTitle}>Cancelar {BRAND.subscriptionName}?</Text>
            <Text style={s.modalBody}>
              A renovação será interrompida e o selo verificado será removido
              quando o Mercado Pago confirmar o cancelamento. As ferramentas
              profissionais continuarão disponíveis.
            </Text>
            <View style={s.modalActions}>
              <Pressable onPress={() => setIsCancelConfirmationVisible(false)} style={s.modalSecondaryButton}>
                <Text style={s.modalSecondaryButtonText}>Manter assinatura</Text>
              </Pressable>
              <Pressable onPress={() => void cancelSubscription()} style={s.modalDangerButton}>
                <Text style={s.modalDangerButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metricItem}>
      <Text numberOfLines={1} style={s.metricValue}>{value}</Text>
      <Text numberOfLines={1} style={s.metricLabel}>{label}</Text>
    </View>
  );
}
