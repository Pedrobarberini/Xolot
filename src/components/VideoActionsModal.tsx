import React from "react";
import { Eye, EyeOff, MoreVertical, Share2, Trash2, X } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";

export function VideoActionsModal({
  canDelete,
  hidden,
  onClose,
  onDelete,
  onShare,
  onToggleHidden,
  videoTitle,
  visible
}: {
  canDelete: boolean;
  hidden: boolean;
  onClose: () => void;
  onDelete: () => void;
  onShare: () => void;
  onToggleHidden: () => void;
  videoTitle: string;
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
          accessibilityLabel="Fechar opcoes da publicacao"
          onPress={onClose}
          style={styles.videoActionsBackdrop}
        />
        <View accessibilityViewIsModal style={styles.videoActionsSheet}>
          <View style={styles.videoActionsHeader}>
            <View style={styles.videoActionsHeaderIcon}>
              <MoreVertical color={colors.primary} size={20} />
            </View>
            <View style={styles.videoActionsTitleBlock}>
              <Text style={styles.videoActionsTitle}>Publicação</Text>
              <Text numberOfLines={1} style={styles.videoActionsSubtitle}>
                {videoTitle}
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
            onPress={onShare}
            style={styles.videoActionRow}
          >
            <Share2 color={colors.text} size={20} />
            <Text style={styles.videoActionText}>Compartilhar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onToggleHidden}
            style={styles.videoActionRow}
          >
            {hidden ? (
              <Eye color={colors.text} size={20} />
            ) : (
              <EyeOff color={colors.text} size={20} />
            )}
            <Text style={styles.videoActionText}>
              {hidden ? "Mostrar no Início" : "Ocultar do Início"}
            </Text>
          </Pressable>
          {canDelete ? (
            <Pressable
              accessibilityRole="button"
              onPress={onDelete}
              style={[styles.videoActionRow, styles.videoActionDanger]}
            >
              <Trash2 color={colors.danger} size={20} />
              <Text style={styles.videoActionDangerText}>Excluir</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
