import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Move, X } from "lucide-react-native";
import { Modal, PanResponder, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { ProfileAvatar } from "../types";
import {
  AVATAR_FOCUS_MARKER_RADIUS,
  AvatarPreviewSize,
  getAvatarFocusFromPoint,
  getAvatarMarkerPoint
} from "../utils/avatarFocus";
import { ProfileAvatarImage } from "./ProfileAvatarImage";

const DEFAULT_PREVIEW_SIZE = 210;

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
  const [previewSize, setPreviewSize] = useState<AvatarPreviewSize>({
    height: DEFAULT_PREVIEW_SIZE,
    width: DEFAULT_PREVIEW_SIZE
  });
  const previewSizeRef = useRef(previewSize);

  const updateFocusFromPoint = useCallback((x: number, y: number) => {
    const size = previewSizeRef.current;
    const nextFocus = getAvatarFocusFromPoint(x, y, size);

    setFocusX(nextFocus.focusX);
    setFocusY(nextFocus.focusY);
  }, []);

  const focusPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) =>
          updateFocusFromPoint(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY
          ),
        onPanResponderMove: (event) =>
          updateFocusFromPoint(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY
          ),
        onPanResponderTerminationRequest: () => false,
        onStartShouldSetPanResponder: () => true
      }),
    [updateFocusFromPoint]
  );

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
  const markerPoint = getAvatarMarkerPoint(focusX, focusY, previewSize);

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
              <Text style={styles.avatarPositionSubtitle}>
                Arraste o ponto em destaque
              </Text>
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

          <View
            accessibilityLabel="Ponto focal da foto"
            accessibilityRole="adjustable"
            accessibilityValue={{
              text: `${Math.round(focusX)}% horizontal, ${Math.round(focusY)}% vertical`
            }}
            onLayout={(event) => {
              const nextSize = {
                height: event.nativeEvent.layout.height,
                width: event.nativeEvent.layout.width
              };

              previewSizeRef.current = nextSize;
              setPreviewSize(nextSize);
            }}
            style={styles.avatarPositionPreview}
            {...focusPanResponder.panHandlers}
          >
            <ProfileAvatarImage avatar={previewAvatar} />
            <View pointerEvents="none" style={styles.avatarPositionGrid}>
              {Array.from({ length: 9 }, (_, index) => (
                <View key={index} style={styles.avatarPositionGridCell} />
              ))}
            </View>
            <View
              pointerEvents="none"
              style={[
                styles.avatarPositionMarker,
                {
                  left: markerPoint.x - AVATAR_FOCUS_MARKER_RADIUS,
                  top: markerPoint.y - AVATAR_FOCUS_MARKER_RADIUS
                }
              ]}
            >
              <Move color={colors.onPrimary} size={16} strokeWidth={2.8} />
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
