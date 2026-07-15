import React, { useState } from "react";
import { CircleDollarSign, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import { USE_CENTERED_WEB_LAYOUT } from "../constants/layout";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { Investment } from "../types";
import { formatBRL, formatPercent } from "../utils/investment";

export function PortfolioScreen({
  balance,
  investments,
  onDeposit
}: {
  balance: number;
  investments: Investment[];
  onDeposit: (amount: number) => void;
}) {
  const { width } = useWindowDimensions();
  const [isDepositVisible, setIsDepositVisible] = useState(false);
  const isWide = !USE_CENTERED_WEB_LAYOUT && width >= 840;
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const supportedAthletes = new Set(
    investments.map((investment) => investment.profileId)
  ).size;

  return (
    <>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <View style={styles.summaryBand}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryLabel}>Saldo disponivel</Text>
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
          <Text style={styles.summaryBody}>
            Saldo, depositos e reservas sao simulacoes locais. Nenhuma cobranca
            ou transferencia bancaria sera realizada.
          </Text>
        </View>

        <View style={isWide ? styles.portfolioDesktopGrid : null}>
          <View style={isWide ? styles.portfolioDesktopColumn : null}>
            <View style={styles.infoPanel}>
              <Text style={styles.sectionTitle}>Custodia da bolsa</Text>
              <Text style={styles.bodyText}>
                Cada aporte fica vinculado ao perfil do atleta. Nesta
                simulacao, o atleta acompanha a captacao, mas nao possui opcao
                de saque.
              </Text>
            </View>
          </View>

          <View style={isWide ? styles.portfolioDesktopColumn : null}>
            {investments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
                <Text style={styles.emptyBody}>
                  Deposite saldo simulado e abra um perfil no feed para criar
                  uma reserva.
                </Text>
              </View>
            ) : (
              investments.map((investment) => {
                return (
                  <View key={investment.id} style={styles.portfolioItemBlock}>
                    <View style={styles.portfolioItemHeader}>
                      <View style={styles.submissionTextBlock}>
                        <Text style={styles.portfolioName}>
                          {investment.playerName}
                        </Text>
                        <Text style={styles.portfolioMeta}>
                          {investment.status}
                        </Text>
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
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
      <DepositModal
        balance={balance}
        onClose={() => setIsDepositVisible(false)}
        onConfirm={onDeposit}
        visible={isDepositVisible}
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
          accessibilityLabel="Fechar deposito"
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

          <Text style={styles.inputLabel}>Valor do deposito</Text>
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
              <Text style={styles.depositConfirmText}>Confirmar deposito</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
