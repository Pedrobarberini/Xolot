import React from "react";
import {
  Bell,
  BellOff,
  Pin,
  PinOff,
  Trash2,
  X
} from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { MessageContact } from "../types";

export function ConversationActionsModal({
  contact,
  isMuted,
  isPinned,
  onClose,
  onDelete,
  onToggleMute,
  onTogglePin
}: {
  contact: MessageContact | null;
  isMuted: boolean;
  isPinned: boolean;
  onClose: () => void;
  onDelete: () => void;
  onToggleMute: () => void;
  onTogglePin: () => boolean;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={Boolean(contact)}
    >
      <View style={styles.conversationActionsRoot}>
        <Pressable
          accessibilityLabel="Fechar opções da conversa"
          onPress={onClose}
          style={styles.conversationActionsBackdrop}
        />
        <View accessibilityViewIsModal style={styles.conversationActionsDialog}>
          <View style={styles.conversationActionsHeader}>
            <View style={styles.conversationActionsTitleBlock}>
              <Text style={styles.conversationActionsTitle}>Conversa</Text>
              <Text numberOfLines={1} style={styles.conversationActionsSubtitle}>
                {contact?.username ? `@${contact.username}` : contact?.name}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={styles.conversationActionsClose}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (onTogglePin()) {
                onClose();
              }
            }}
            style={styles.conversationActionRow}
          >
            {isPinned ? (
              <PinOff color={colors.text} size={20} />
            ) : (
              <Pin color={colors.text} size={20} />
            )}
            <Text style={styles.conversationActionText}>
              {isPinned ? "Desafixar" : "Fixar"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onToggleMute();
              onClose();
            }}
            style={styles.conversationActionRow}
          >
            {isMuted ? (
              <Bell color={colors.text} size={20} />
            ) : (
              <BellOff color={colors.text} size={20} />
            )}
            <Text style={styles.conversationActionText}>
              {isMuted ? "Ativar notificações" : "Silenciar notificações"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onClose();
              onDelete();
            }}
            style={[styles.conversationActionRow, styles.conversationActionDanger]}
          >
            <Trash2 color={colors.danger} size={20} />
            <Text style={styles.conversationActionDangerText}>
              Apagar conversa
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
