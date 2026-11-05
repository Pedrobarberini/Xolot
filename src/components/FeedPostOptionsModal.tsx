import React from "react";
import {
  CheckCircle2,
  EyeOff,
  Flag,
  MoreVertical,
  ThumbsUp,
  UserRoundX,
  X
} from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";

export function FeedPostOptionsModal({
  blocked,
  canBlock,
  canReport,
  contentLabel,
  interested,
  muted,
  onClose,
  onReport,
  onToggleBlock,
  onToggleInterest,
  onToggleMuted,
  reported,
  visible
}: {
  blocked: boolean;
  canBlock: boolean;
  canReport: boolean;
  contentLabel: string;
  interested: boolean;
  muted: boolean;
  onClose: () => void;
  onReport: () => void;
  onToggleBlock: () => void;
  onToggleInterest: () => void;
  onToggleMuted: () => void;
  reported: boolean;
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
      <View style={styles.videoActionsRoot}>
        <Pressable
          accessibilityLabel="Fechar preferências da publicação"
          onPress={onClose}
          style={styles.videoActionsBackdrop}
        />
        <View accessibilityViewIsModal style={styles.videoActionsSheet}>
          <View style={styles.videoActionsHeader}>
            <View style={styles.videoActionsHeaderIcon}>
              <MoreVertical color={colors.primaryText} size={20} />
            </View>
            <View style={styles.videoActionsTitleBlock}>
              <Text style={styles.videoActionsTitle}>Preferências</Text>
              <Text numberOfLines={1} style={styles.videoActionsSubtitle}>
                Conteúdo relacionado a {contentLabel}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              hitSlop={8}
              onPress={onClose}
              style={styles.videoActionsClose}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onToggleInterest}
            style={styles.videoActionRow}
          >
            {interested ? (
              <CheckCircle2 color={colors.primaryText} size={20} />
            ) : (
              <ThumbsUp color={colors.text} size={20} />
            )}
            <View style={styles.feedPreferenceTextBlock}>
              <Text style={styles.videoActionText}>
                {interested
                  ? "Interesse registrado"
                  : "Tenho interesse neste tipo de post"}
              </Text>
              <Text style={styles.feedPreferenceHint}>
                {interested
                  ? "Toque para remover esta preferência."
                  : "Conteúdos semelhantes ganham prioridade."}
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onToggleMuted}
            style={styles.videoActionRow}
          >
            <EyeOff color={colors.text} size={20} />
            <View style={styles.feedPreferenceTextBlock}>
              <Text style={styles.videoActionText}>
                {muted
                  ? "Voltar a mostrar posts deste tipo"
                  : "Não mostrar posts deste tipo"}
              </Text>
              <Text style={styles.feedPreferenceHint}>{contentLabel}</Text>
            </View>
          </Pressable>

          {canReport ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: reported }}
              disabled={reported}
              onPress={onReport}
              style={[
                styles.videoActionRow,
                reported ? styles.videoActionDisabled : null
              ]}
            >
              <Flag
                color={reported ? colors.muted : colors.danger}
                size={20}
              />
              <View style={styles.feedPreferenceTextBlock}>
                <Text style={reported ? styles.videoActionText : styles.videoActionDangerText}>
                  {reported ? "Denúncia enviada" : "Denunciar publicação"}
                </Text>
                <Text style={styles.feedPreferenceHint}>
                  {reported
                    ? "Revise ou desfaça em Segurança."
                    : "Registrar esta publicação para revisão."}
                </Text>
              </View>
            </Pressable>
          ) : null}

          {canBlock ? (
            <Pressable
              accessibilityRole="button"
              onPress={onToggleBlock}
              style={[styles.videoActionRow, styles.videoActionDanger]}
            >
              <UserRoundX color={colors.danger} size={20} />
              <View style={styles.feedPreferenceTextBlock}>
                <Text style={styles.videoActionDangerText}>
                  {blocked ? "Desbloquear perfil" : "Bloquear perfil"}
                </Text>
                <Text style={styles.feedPreferenceHint}>
                  {blocked
                    ? "Os posts deste perfil voltarão ao Início."
                    : "Os posts deste perfil deixarão de aparecer."}
                </Text>
              </View>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
