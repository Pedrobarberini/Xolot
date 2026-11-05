import { BRAND } from "../config/brand.ts";
import React from "react";
import { BadgeCheck, Clock3, ShieldCheck, TriangleAlert } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BackButton } from "../components/Navigation";
import { professionalStyles as s } from "../styles/professionalStyles";
import { colors } from "../theme";
import type { IdentityVerification } from "../types";

export function IdentityVerificationScreen({
  age,
  onBack,
  onContinue,
  verification
}: {
  age: number | null;
  onBack: () => void;
  onContinue: () => void;
  verification: IdentityVerification | null;
}) {
  const isApproved = verification?.status === "approved";
  const isPending = verification?.status === "pending";
  const isRejected = verification?.status === "rejected";
  const isMinor = typeof age === "number" && age < 18;

  return (
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.header}>
        <BackButton accessibilityLabel="Voltar ao painel profissional" onPress={onBack} />
        <Text style={s.headerTitle}>Verificar identidade</Text>
        <View style={s.headerSpacer} />
      </View>

      <View style={s.hero}>
        <Text style={s.heroEyebrow}>{BRAND.subscriptionName}</Text>
        <Text style={s.heroTitle}>Selo com identidade confirmada</Text>
        <Text style={s.heroDescription}>
          A assinatura sozinha não libera o selo. A identidade precisa ser
          aprovada por um processo seguro antes do pagamento.
        </Text>
      </View>

      <View style={s.section}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>
              {isApproved
                ? "Identidade aprovada"
                : isPending
                  ? "Verificação em análise"
                  : isRejected
                    ? "Verificação não aprovada"
                    : "Verificação necessária"}
            </Text>
            <Text style={s.sectionDescription}>
              {isApproved
                ? "Você já pode seguir para a assinatura do selo verificado."
                : isPending
                  ? "Aguarde a conclusão da análise antes de assinar."
                  : isRejected
                    ? verification.reviewNote || "Revise seus dados quando um novo envio estiver disponível."
                    : "RG e CPF serão validados por um parceiro especializado em identidade."}
            </Text>
          </View>
          {isApproved ? (
            <BadgeCheck color={colors.primaryText} size={30} />
          ) : isPending ? (
            <Clock3 color={colors.primaryText} size={30} />
          ) : (
            <ShieldCheck color={colors.primaryText} size={30} />
          )}
        </View>
      </View>

      <View style={s.notice}>
        <Text style={s.noticeText}>
          A {BRAND.name} não armazenará fotos de RG nem números completos de CPF no
          banco público do aplicativo. A coleta será aberta somente após a
          integração com um provedor de verificação documental.
        </Text>
      </View>

      {isMinor ? (
        <View style={s.section}>
          <View style={s.row}>
            <TriangleAlert color={colors.danger} size={24} />
            <View style={{ flex: 1 }}>
              <Text style={s.optionTitle}>Responsável legal necessário</Text>
              <Text style={s.optionDescription}>
                A verificação de menores será liberada após a implantação do
                consentimento e da validação do responsável legal.
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!isApproved}
        onPress={onContinue}
        style={[s.actionButton, !isApproved ? s.actionButtonDisabled : null]}
      >
        <BadgeCheck color={colors.onPrimary} size={19} />
        <Text style={s.actionButtonText}>
          {isApproved
            ? "Continuar para assinatura"
            : isPending
              ? "Análise em andamento"
              : "Verificação segura em preparação"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
