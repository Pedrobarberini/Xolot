import { BRAND } from "../config/brand.ts";
import React, { useState } from "react";
import { CreditCard, Megaphone, Play } from "lucide-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { BackButton } from "../components/Navigation";
import { professionalStyles as s } from "../styles/professionalStyles";
import { colors } from "../theme";
import type { CampaignObjective, Player } from "../types";
import {
  CAMPAIGN_OBJECTIVE_OPTIONS,
  formatCurrency
} from "../utils/professional";

const DURATION_OPTIONS = [3, 7, 14];
const BUDGET_OPTIONS = [20, 50, 100];

export function PromotePostScreen({
  onBack,
  player
}: {
  onBack: () => void;
  onCreate: (input: {
    budget: number;
    durationDays: number;
    objective: CampaignObjective;
  }) => boolean;
  player: Player;
}) {
  const [objective, setObjective] = useState<CampaignObjective>("reach");
  const [durationDays, setDurationDays] = useState(7);
  const [budget, setBudget] = useState(50);
  const resolvedMedia = useResolvedVideoSource(player.videoUri);

  return (
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.header}>
        <BackButton accessibilityLabel="Voltar ao painel profissional" onPress={onBack} />
        <Text style={s.headerTitle}>Promover publicação</Text>
        <View style={s.headerSpacer} />
      </View>

      <View style={s.preview}>
        {player.mediaType === "image" && resolvedMedia.source ? (
          <Image
            resizeMode="cover"
            source={typeof resolvedMedia.source === "number" ? resolvedMedia.source : { uri: resolvedMedia.source }}
            style={s.previewImage}
          />
        ) : (
          <View style={s.previewOverlay}>
            <Play color={colors.onPrimary} fill={colors.onPrimary} size={42} />
          </View>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>{player.videoTitle}</Text>
        <Text numberOfLines={2} style={s.sectionDescription}>{player.highlight}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.label}>Objetivo</Text>
        {CAMPAIGN_OBJECTIVE_OPTIONS.map((option) => {
          const active = objective === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setObjective(option.id)}
              style={[s.optionCard, { marginBottom: 8 }, active ? s.optionCardActive : null]}
            >
              <View style={s.optionHeader}>
                <Text style={s.optionTitle}>{option.label}</Text>
                {active ? <Megaphone color={colors.primaryText} size={18} /> : null}
              </View>
              <Text style={s.optionDescription}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.section}>
        <Text style={s.label}>Duração</Text>
        <View style={s.selectorRow}>
          {DURATION_OPTIONS.map((days) => {
            const active = durationDays === days;
            return (
              <Pressable key={days} onPress={() => setDurationDays(days)} style={[s.smallSelector, active ? s.smallSelectorActive : null]}>
                <Text style={[s.smallSelectorText, active ? s.smallSelectorTextActive : null]}>{days} dias</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.label}>Orçamento total</Text>
        <View style={s.selectorRow}>
          {BUDGET_OPTIONS.map((value) => {
            const active = budget === value;
            return (
              <Pressable key={value} onPress={() => setBudget(value)} style={[s.smallSelector, active ? s.smallSelectorActive : null]}>
                <Text style={[s.smallSelectorText, active ? s.smallSelectorTextActive : null]}>{formatCurrency(value)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={s.notice}>
        <Text style={s.noticeText}>
          O impulsionamento será uma compra separada do {BRAND.subscriptionName}. Alcance,
          pagamento e entrega só serão exibidos depois da confirmação do backend
          de anúncios. Nenhuma cobrança foi realizada nesta tela.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled
        style={[s.actionButton, s.actionButtonDisabled]}
      >
        <CreditCard color={colors.onPrimary} size={19} />
        <Text style={s.actionButtonText}>Pagamento por campanha em preparação</Text>
      </Pressable>
    </ScrollView>
  );
}
