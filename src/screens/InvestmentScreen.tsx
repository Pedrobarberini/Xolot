import React, { useState } from "react";
import { CircleDollarSign, X } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { DetailHud } from "../components/Navigation";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AthleteFund, Player, ProfileAvatar } from "../types";
import { formatBRL } from "../utils/investment";

export function InvestmentScreen({
  avatar,
  fund,
  onBack,
  onInvest,
  player,
  walletBalance
}: {
  avatar?: ProfileAvatar;
  fund: AthleteFund;
  onBack: () => void;
  onInvest: (player: Player, amount: number) => void;
  player: Player;
  walletBalance: number;
}) {
  const [amountText, setAmountText] = useState(
    String(fund.minimumContribution)
  );
  const amount = Number(amountText.replace(/\D/g, "")) || 0;
  const remainingAmount = Math.max(0, fund.goalAmount - fund.fundedAmount);
  const fundProgress = Math.min(fund.fundedAmount / fund.goalAmount, 1);
  const hasValidAmount =
    amount >= fund.minimumContribution && amount <= remainingAmount;
  const hasAvailableBalance = amount <= walletBalance;
  const canSubmit =
    fund.status === "Captando" && hasValidAmount && hasAvailableBalance;
  const initials = player.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View style={styles.publicProfileShell}>
      <ScrollView
        contentContainerStyle={[styles.screenContent, styles.investmentContent]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileHero}>
          <View style={styles.profileHeroTopRow}>
            <View style={styles.profileAvatar}>
              {avatar ? (
                <ProfileAvatarImage avatar={avatar} />
              ) : (
                <Text style={styles.profileAvatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.profileTitleBlock}>
              <Text
                numberOfLines={1}
                style={styles.profilePrimaryUsername}
              >
                {player.username ? `@${player.username}` : player.name}
              </Text>
              {player.username ? (
                <Text numberOfLines={1} style={styles.profileSecondaryName}>
                  {player.name}
                </Text>
              ) : null}
              <Text numberOfLines={1} style={styles.profileMeta}>
                {player.position} | {player.city}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar investimento e voltar ao perfil"
              accessibilityRole="button"
              hitSlop={6}
              onPress={onBack}
              style={({ pressed }) => [
                styles.investmentCloseButton,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <X color={colors.text} size={21} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        <View style={styles.investmentPanel}>
          <View style={styles.fundTitleRow}>
            <Text style={styles.sectionTitle}>Bolsa de investimento</Text>
            <Text style={styles.fundStatus}>{fund.status}</Text>
          </View>
          <Text style={styles.bodyText}>
            O aporte e vinculado ao perfil do atleta e fica sob custódia
            simulada do Xolot.
          </Text>

          <View style={styles.fundProgressHeader}>
            <Text style={styles.fundProgressValue}>
              {formatBRL(fund.fundedAmount)} captados
            </Text>
            <Text style={styles.fundProgressGoal}>
              Meta {formatBRL(fund.goalAmount)}
            </Text>
          </View>
          <View style={styles.fundProgressTrack}>
            <View
              style={[
                styles.fundProgressFill,
                { width: `${fundProgress * 100}%` }
              ]}
            />
          </View>

          <View style={styles.fundStatsRow}>
            <View style={styles.fundStatItem}>
              <Text style={styles.fundStatValue}>
                {formatBRL(remainingAmount)}
              </Text>
              <Text style={styles.fundStatLabel}>restante</Text>
            </View>
            <View style={styles.fundStatItem}>
              <Text style={styles.fundStatValue}>
                {formatBRL(fund.minimumContribution)}
              </Text>
              <Text style={styles.fundStatLabel}>aporte mínimo</Text>
            </View>
          </View>

          <Text style={styles.availableBalanceText}>
            Saldo disponível: {formatBRL(walletBalance)}
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput
              accessibilityLabel="Valor do investimento"
              keyboardType="number-pad"
              onChangeText={setAmountText}
              placeholder="Valor"
              placeholderTextColor={colors.muted}
              style={styles.amountInput}
              value={amountText}
            />
          </View>

          {!hasValidAmount ? (
            <Text style={styles.validationText}>
              Informe entre {formatBRL(fund.minimumContribution)} e{" "}
              {formatBRL(remainingAmount)}.
            </Text>
          ) : null}
          {!hasAvailableBalance ? (
            <Text style={styles.validationText}>
              Saldo insuficiente. Use a Carteira no menu do Perfil para
              depositar.
            </Text>
          ) : null}

          <Pressable
            accessibilityLabel="Confirmar investimento"
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={() => onInvest(player, amount)}
            style={[
              styles.primaryButton,
              !canSubmit ? styles.primaryButtonDisabled : null
            ]}
          >
            <CircleDollarSign color={colors.onPrimary} size={19} />
            <Text style={styles.primaryButtonText}>Confirmar investimento</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DetailHud
        backLabel="Voltar ao perfil"
        onBack={onBack}
        walletBalance={walletBalance}
      />
    </View>
  );
}
