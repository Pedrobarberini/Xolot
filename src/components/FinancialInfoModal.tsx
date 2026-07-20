import React from "react";
import {
  ArrowLeftRight,
  Info,
  LockKeyhole,
  TrendingUp,
  X
} from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";

const FINANCIAL_TOPICS = [
  {
    body:
      "Depósitos e aportes registram movimentações dentro da plataforma. No ambiente atual, nenhum valor é enviado ou recebido por uma conta bancária.",
    icon: ArrowLeftRight,
    title: "Transações"
  },
  {
    body:
      "O aporte fica vinculado ao perfil do atleta. O atleta acompanha a captação, mas o saque permanece indisponível enquanto não houver operação financeira e regras contratuais aprovadas.",
    icon: LockKeyhole,
    title: "Custódia e saque"
  },
  {
    body:
      "A cota mostra a participação proporcional adquirida. O app ainda não calcula rendimento, não promete retorno e não realiza distribuição de ganhos.",
    icon: TrendingUp,
    title: "Rendimento"
  }
] as const;

export function FinancialInfoModal({
  onClose,
  visible
}: {
  onClose: () => void;
  visible: boolean;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.depositModalRoot}>
        <Pressable
          accessibilityLabel="Fechar informações financeiras"
          onPress={onClose}
          style={styles.depositModalBackdrop}
        />
        <View
          accessibilityViewIsModal
          style={[styles.depositDialog, styles.financialInfoDialog]}
        >
          <View style={styles.depositDialogHeader}>
            <View style={styles.depositDialogTitleBlock}>
              <Text style={styles.depositDialogTitle}>Como funciona</Text>
              <Text style={styles.depositDialogSubtitle}>
                Regras atuais para movimentações, saque e participação.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={styles.depositCloseButton}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <View style={styles.financialInfoList}>
            {FINANCIAL_TOPICS.map((topic) => {
              const TopicIcon = topic.icon;

              return (
                <View key={topic.title} style={styles.financialInfoItem}>
                  <View style={styles.financialInfoItemIcon}>
                    <TopicIcon color={colors.primary} size={19} strokeWidth={2} />
                  </View>
                  <View style={styles.financialInfoItemBody}>
                    <Text style={styles.financialInfoItemTitle}>
                      {topic.title}
                    </Text>
                    <Text style={styles.financialInfoItemText}>
                      {topic.body}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.financialInfoNotice}>
            <Info color={colors.primary} size={17} strokeWidth={2.2} />
            <Text style={styles.financialInfoNoticeText}>
              As operações permanecem simuladas e sem validade financeira até a
              implantação dos parceiros, contratos e controles regulatórios.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
