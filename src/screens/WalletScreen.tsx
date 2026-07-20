import React, { useState } from "react";
import {
  ArrowLeft,
  BanknoteArrowDown,
  CircleDollarSign,
  Info,
  X
} from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { FinancialInfoModal } from "../components/FinancialInfoModal";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AthleteFund, Investment, Player } from "../types";
import { formatBRL, formatPercent } from "../utils/investment";
import {
  MAX_WALLET_DEPOSIT_AMOUNT,
  MIN_WALLET_OPERATION_AMOUNT,
  isValidDepositAmount,
  isValidWithdrawalAmount
} from "../utils/wallet";

type WalletOperation = "deposit" | "withdraw";

export function PortfolioScreen({
  balance,
  fund,
  investments,
  onBack,
  onDeposit,
  onRequestOpenFund,
  onWithdraw,
  player,
  submissionsCount
}: {
  balance: number;
  fund?: AthleteFund;
  investments: Investment[];
  onBack?: () => void;
  onDeposit: (amount: number) => void;
  onRequestOpenFund: () => void;
  onWithdraw: (amount: number) => void;
  player?: Player;
  submissionsCount: number;
}) {
  const [activeOperation, setActiveOperation] =
    useState<WalletOperation | null>(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const fundProgress = fund
    ? Math.min(fund.fundedAmount / fund.goalAmount, 1)
    : 0;

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
          </View>
          <Text style={styles.summaryValue}>{formatBRL(balance)}</Text>
          <View style={styles.walletActionRow}>
            <Pressable
              accessibilityLabel="Depositar saldo"
              accessibilityRole="button"
              onPress={() => setActiveOperation("deposit")}
              style={({ pressed }) => [
                styles.depositButton,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <CircleDollarSign color={colors.onPrimary} size={18} />
              <Text style={styles.depositButtonText}>Depositar</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Sacar saldo"
              accessibilityRole="button"
              disabled={balance < MIN_WALLET_OPERATION_AMOUNT}
              onPress={() => setActiveOperation("withdraw")}
              style={({ pressed }) => [
                styles.withdrawButton,
                balance < MIN_WALLET_OPERATION_AMOUNT
                  ? styles.walletActionButtonDisabled
                  : null,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <BanknoteArrowDown color={colors.text} size={18} />
              <Text style={styles.withdrawButtonText}>Sacar</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Conta NextStar</Text>
          <View style={styles.profileRowNoBorder}>
            <Text style={styles.profileLabel}>Reservas simuladas</Text>
            <Text style={styles.profileValue}>{investments.length}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Total</Text>
            <Text style={styles.profileValue}>{formatBRL(totalInvested)}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Vídeos enviados</Text>
            <Text style={styles.profileValue}>{submissionsCount}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Status padrão</Text>
            <Text style={styles.profileValue}>Publicação direta (teste)</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.fundTitleRow}>
            <Text style={styles.settingsSectionTitle}>
              Bolsa de investimento
            </Text>
            {fund ? (
              <Text
                style={[
                  styles.fundStatus,
                  fund.status === "Concluída"
                    ? styles.fundStatusComplete
                    : null
                ]}
              >
                {fund.status}
              </Text>
            ) : null}
          </View>

          {fund?.status === "Concluída" ? (
            <View style={styles.settingsFundComplete}>
              <Text style={styles.settingsFundCompleteTitle}>
                Investimento concluído
              </Text>
              <Text style={styles.settingsFundCompleteBody}>
                Sua meta foi atingida. Seu perfil está em busca de contratantes.
              </Text>
            </View>
          ) : null}

          {fund ? (
            <>
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
            </>
          ) : (
            <>
              <Text style={styles.bodyText}>
                Abra uma bolsa vinculada ao perfil público para receber aportes
                simulados de outros usuários.
              </Text>
              {!player ? (
                <Text style={styles.validationText}>
                  Publique um vídeo para criar seu perfil público antes de abrir
                  a bolsa.
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={!player}
                onPress={onRequestOpenFund}
                style={[
                  styles.primaryButton,
                  !player ? styles.primaryButtonDisabled : null
                ]}
              >
                <CircleDollarSign color={colors.onPrimary} size={18} />
                <Text style={styles.primaryButtonText}>
                  Abrir bolsa de investimento
                </Text>
              </Pressable>
            </>
          )}
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
      <WalletOperationModal
        balance={balance}
        onClose={() => setActiveOperation(null)}
        onConfirm={(amount) => {
          if (activeOperation === "withdraw") {
            onWithdraw(amount);
            return;
          }

          onDeposit(amount);
        }}
        operation={activeOperation ?? "deposit"}
        visible={activeOperation !== null}
      />
      <FinancialInfoModal
        onClose={() => setIsInfoVisible(false)}
        visible={isInfoVisible}
      />
    </>
  );
}

function WalletOperationModal({
  balance,
  onClose,
  onConfirm,
  operation,
  visible
}: {
  balance: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  operation: WalletOperation;
  visible: boolean;
}) {
  const [amountText, setAmountText] = useState("");
  const amount = Number(amountText.replace(/\D/g, "")) || 0;
  const isDeposit = operation === "deposit";
  const canConfirm = isDeposit
    ? isValidDepositAmount(amount)
    : isValidWithdrawalAmount(balance, amount);

  function closeModal() {
    setAmountText("");
    onClose();
  }

  function confirmOperation() {
    if (!canConfirm) {
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
          accessibilityLabel={isDeposit ? "Fechar depósito" : "Fechar saque"}
          onPress={closeModal}
          style={styles.depositModalBackdrop}
        />
        <View accessibilityViewIsModal style={styles.depositDialog}>
          <View style={styles.depositDialogHeader}>
            <View style={styles.depositDialogTitleBlock}>
              <Text style={styles.depositDialogTitle}>
                {isDeposit ? "Depositar saldo" : "Sacar saldo"}
              </Text>
              <Text style={styles.depositDialogSubtitle}>
                {isDeposit
                  ? "Adição simulada, sem cobrança bancária."
                  : "Retirada simulada do saldo disponível, sem transferência bancária."}
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

          <Text style={styles.inputLabel}>
            {isDeposit ? "Valor do depósito" : "Valor do saque"}
          </Text>
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
                disabled={!isDeposit && preset > balance}
                key={preset}
                onPress={() => setAmountText(String(preset))}
                style={[
                  styles.depositPresetButton,
                  amount === preset ? styles.depositPresetButtonActive : null,
                  !isDeposit && preset > balance
                    ? styles.walletActionButtonDisabled
                    : null
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

          {amount > 0 && !canConfirm ? (
            <Text style={styles.validationText}>
              {isDeposit
                ? `Informe um valor entre ${formatBRL(MIN_WALLET_OPERATION_AMOUNT)} e ${formatBRL(MAX_WALLET_DEPOSIT_AMOUNT)}.`
                : `Informe um valor entre ${formatBRL(MIN_WALLET_OPERATION_AMOUNT)} e ${formatBRL(balance)}.`}
            </Text>
          ) : null}

          <View style={styles.depositDialogActions}>
            <Pressable onPress={closeModal} style={styles.depositCancelButton}>
              <Text style={styles.depositCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={!canConfirm}
              onPress={confirmOperation}
              style={[
                styles.depositConfirmButton,
                !canConfirm ? styles.primaryButtonDisabled : null
              ]}
            >
              <Text style={styles.depositConfirmText}>
                {isDeposit ? "Confirmar depósito" : "Confirmar saque"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
