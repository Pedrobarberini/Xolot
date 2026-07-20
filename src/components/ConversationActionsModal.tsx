import React, { useEffect, useState } from "react";
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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
  }, [contact?.id]);

  const closeModal = () => {
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={closeModal}
      statusBarTranslucent
      transparent
      visible={Boolean(contact)}
    >
      <View style={styles.conversationActionsRoot}>
        <Pressable
          accessibilityLabel="Fechar opções da conversa"
          onPress={closeModal}
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
              onPress={closeModal}
              style={styles.conversationActionsClose}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          {isConfirmingDelete ? (
            <View style={styles.conversationDeleteConfirmation}>
              <View style={styles.conversationDeleteIcon}>
                <Trash2 color={colors.danger} size={22} />
              </View>
              <Text style={styles.conversationDeleteTitle}>
                Apagar conversa?
              </Text>
              <Text style={styles.conversationDeleteBody}>
                O histórico com {contact?.name} será removido somente para você.
              </Text>
              <View style={styles.conversationDeleteActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setIsConfirmingDelete(false)}
                  style={styles.conversationDeleteCancelButton}
                >
                  <Text style={styles.conversationDeleteCancelText}>
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Confirmar exclusão da conversa"
                  accessibilityRole="button"
                  onPress={() => {
                    onDelete();
                    closeModal();
                  }}
                  style={styles.conversationDeleteConfirmButton}
                >
                  <Trash2 color={colors.onPrimary} size={17} />
                  <Text style={styles.conversationDeleteConfirmText}>
                    Apagar
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (onTogglePin()) {
                    closeModal();
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
                  closeModal();
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
                onPress={() => setIsConfirmingDelete(true)}
                style={[
                  styles.conversationActionRow,
                  styles.conversationActionDanger
                ]}
              >
                <Trash2 color={colors.danger} size={20} />
                <Text style={styles.conversationActionDangerText}>
                  Apagar conversa
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
