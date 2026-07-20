import React, { useState } from "react";
import { ArrowLeft, CircleDollarSign, Info, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { FinancialInfoModal } from "../components/FinancialInfoModal";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { Investment } from "../types";
import { formatBRL, formatPercent } from "../utils/investment";

export function PortfolioScreen({
  balance,
  investments,
  onBack,
  onDeposit
}: {
  balance: number;
  investments: Investment[];
  onBack?: () => void;
  onDeposit: (amount: number) => void;
}) {
  const [isDepositVisible, setIsDepositVisible] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const supportedAthletes = new Set(
    investments.map((investment) => investment.profileId)
  ).size;

  return (
    <>
      <ScrollView contentContainerStyle={styles.screenContent}>
        {onBack ? (
          <View style={styles.profileSubviewHeader}>
            <Pressable
              accessibilityLabel="Voltar ao perfil"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onBack}
              style={styles.profileSubviewBackButton}
            >
              <ArrowLeft color={colors.text} size={20} />
            </Pressable>
            <Text style={styles.profileSubviewTitle}>Carteira</Text>
            <Pressable
              accessibilityLabel="Informações sobre transações, saque e rendimento"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setIsInfoVisible(true)}
              style={({ pressed }) => [
                styles.walletInfoButton,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <Info color={colors.primary} size={20} strokeWidth={2.2} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.summaryBand}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryLabel}>Saldo disponível</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsDepositVisible(true)}
              style={({ pressed }) => [
                styles.depositButton,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <CircleDollarSign color={colors.onPrimary} size={18} />
              <Text style={styles.depositButtonText}>Depositar</Text>
            </Pressable>
          </View>
          <Text style={styles.summaryValue}>{formatBRL(balance)}</Text>
          <View style={styles.summaryInsightStrip}>
            <View style={styles.summaryInsightItem}>
              <Text style={styles.summaryInsightValue}>
                {formatBRL(totalInvested)}
              </Text>
              <Text style={styles.summaryInsightLabel}>reservado</Text>
            </View>
            <View style={styles.summaryInsightItem}>
              <Text style={styles.summaryInsightValue}>{investments.length}</Text>
              <Text style={styles.summaryInsightLabel}>reservas</Text>
            </View>
            <View style={styles.summaryInsightItem}>
              <Text style={styles.summaryInsightValue}>{supportedAthletes}</Text>
              <Text style={styles.summaryInsightLabel}>atletas</Text>
            </View>
          </View>
        </View>

        {investments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
            <Text style={styles.emptyBody}>
              Deposite saldo simulado e abra um perfil na tela Início para
              criar uma reserva.
            </Text>
          </View>
        ) : (
          investments.map((investment) => (
            <View key={investment.id} style={styles.portfolioItemBlock}>
              <View style={styles.portfolioItemHeader}>
                <View style={styles.submissionTextBlock}>
                  <Text style={styles.portfolioName}>
                    {investment.playerName}
                  </Text>
                  <Text style={styles.portfolioMeta}>{investment.status}</Text>
                </View>
                <View style={styles.portfolioNumbers}>
                  <Text style={styles.portfolioAmount}>
                    {formatBRL(investment.amount)}
                  </Text>
                  <Text style={styles.portfolioShare}>
                    Cota {formatPercent(investment.sharePercent)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <DepositModal
        balance={balance}
        onClose={() => setIsDepositVisible(false)}
        onConfirm={onDeposit}
        visible={isDepositVisible}
      />
      <FinancialInfoModal
        onClose={() => setIsInfoVisible(false)}
        visible={isInfoVisible}
      />
    </>
  );
}

function DepositModal({
  balance,
  onClose,
  onConfirm,
  visible
}: {
  balance: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  visible: boolean;
}) {
  const [amountText, setAmountText] = useState("");
  const amount = Number(amountText.replace(/\D/g, "")) || 0;
  const canDeposit = amount >= 10 && amount <= 100000;

  function closeModal() {
    setAmountText("");
    onClose();
  }

  function confirmDeposit() {
    if (!canDeposit) {
      return;
    }

    onConfirm(amount);
    closeModal();
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={closeModal}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.depositModalRoot}>
        <Pressable
          accessibilityLabel="Fechar depósito"
          onPress={closeModal}
          style={styles.depositModalBackdrop}
        />
        <View accessibilityViewIsModal style={styles.depositDialog}>
          <View style={styles.depositDialogHeader}>
            <View style={styles.depositDialogTitleBlock}>
              <Text style={styles.depositDialogTitle}>Depositar saldo</Text>
              <Text style={styles.depositDialogSubtitle}>
                Operacao demonstrativa, sem cobranca real.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              hitSlop={8}
              onPress={closeModal}
              style={styles.depositCloseButton}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <Text style={styles.depositBalanceLabel}>Saldo atual</Text>
          <Text style={styles.depositBalanceValue}>{formatBRL(balance)}</Text>

          <Text style={styles.inputLabel}>Valor do depósito</Text>
          <View style={styles.depositInputRow}>
            <Text style={styles.depositCurrencyPrefix}>R$</Text>
            <TextInput
              autoFocus
              keyboardType="number-pad"
              onChangeText={setAmountText}
              placeholder="0"
              placeholderTextColor={colors.muted}
              selectTextOnFocus
              style={styles.depositInput}
              value={amountText}
            />
          </View>

          <View style={styles.depositPresetRow}>
            {[50, 100, 250, 500].map((preset) => (
              <Pressable
                key={preset}
                onPress={() => setAmountText(String(preset))}
                style={[
                  styles.depositPresetButton,
                  amount === preset ? styles.depositPresetButtonActive : null
                ]}
              >
                <Text
                  style={[
                    styles.depositPresetText,
                    amount === preset ? styles.depositPresetTextActive : null
                  ]}
                >
                  {formatBRL(preset)}
                </Text>
              </Pressable>
            ))}
          </View>

          {amount > 0 && !canDeposit ? (
            <Text style={styles.validationText}>
              Informe um valor entre R$ 10 e R$ 100.000.
            </Text>
          ) : null}

          <View style={styles.depositDialogActions}>
            <Pressable onPress={closeModal} style={styles.depositCancelButton}>
              <Text style={styles.depositCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={!canDeposit}
              onPress={confirmDeposit}
              style={[
                styles.depositConfirmButton,
                !canDeposit ? styles.primaryButtonDisabled : null
              ]}
            >
              <Text style={styles.depositConfirmText}>Confirmar depósito</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
