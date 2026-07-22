import React from "react";
import {
  CheckCircle2,
  EyeOff,
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
  contentLabel,
  interested,
  muted,
  onClose,
  onToggleBlock,
  onToggleInterest,
  onToggleMuted,
  visible
}: {
  blocked: boolean;
  canBlock: boolean;
  contentLabel: string;
  interested: boolean;
  muted: boolean;
  onClose: () => void;
  onToggleBlock: () => void;
  onToggleInterest: () => void;
  onToggleMuted: () => void;
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
              <MoreVertical color={colors.primary} size={20} />
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
              <CheckCircle2 color={colors.primary} size={20} />
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
