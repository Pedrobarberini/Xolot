import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { ProfileAvatar } from "../types";
import { ProfileAvatarImage } from "./ProfileAvatarImage";

const FOCUS_OPTIONS = [
  { label: "Superior esquerdo", x: 0, y: 0 },
  { label: "Superior central", x: 50, y: 0 },
  { label: "Superior direito", x: 100, y: 0 },
  { label: "Centro esquerdo", x: 0, y: 50 },
  { label: "Centro", x: 50, y: 50 },
  { label: "Centro direito", x: 100, y: 50 },
  { label: "Inferior esquerdo", x: 0, y: 100 },
  { label: "Inferior central", x: 50, y: 100 },
  { label: "Inferior direito", x: 100, y: 100 }
];

export function AvatarPositionModal({
  avatar,
  onClose,
  onSave,
  visible
}: {
  avatar?: ProfileAvatar;
  onClose: () => void;
  onSave: (avatar: ProfileAvatar) => void;
  visible: boolean;
}) {
  const [focusX, setFocusX] = useState(50);
  const [focusY, setFocusY] = useState(50);

  useEffect(() => {
    if (visible && avatar) {
      setFocusX(avatar.focusX);
      setFocusY(avatar.focusY);
    }
  }, [avatar, visible]);

  if (!avatar) {
    return null;
  }

  const previewAvatar = { ...avatar, focusX, focusY };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.avatarPositionModalRoot}>
        <Pressable
          accessibilityLabel="Fechar ajuste da foto"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.avatarPositionBackdrop}
        />
        <View accessibilityViewIsModal style={styles.avatarPositionDialog}>
          <View style={styles.avatarPositionHeader}>
            <View>
              <Text style={styles.avatarPositionTitle}>Ajustar enquadramento</Text>
              <Text style={styles.avatarPositionSubtitle}>Ponto em destaque</Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={styles.avatarPositionCloseButton}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <View style={styles.avatarPositionPreview}>
            <ProfileAvatarImage avatar={previewAvatar} />
            <View style={styles.avatarPositionGrid}>
              {FOCUS_OPTIONS.map((option) => {
                const isActive = option.x === focusX && option.y === focusY;

                return (
                  <Pressable
                    accessibilityLabel={`Enquadrar em ${option.label}`}
                    accessibilityRole="button"
                    key={option.label}
                    onPress={() => {
                      setFocusX(option.x);
                      setFocusY(option.y);
                    }}
                    style={styles.avatarPositionGridCell}
                  >
                    {isActive ? (
                      <View style={styles.avatarPositionMarker}>
                        <Check color={colors.onPrimary} size={16} strokeWidth={3} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.avatarPositionActions}>
            <Pressable onPress={onClose} style={styles.avatarPositionCancelButton}>
              <Text style={styles.avatarPositionCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave(previewAvatar)}
              style={styles.avatarPositionSaveButton}
            >
              <Text style={styles.avatarPositionSaveText}>Salvar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
