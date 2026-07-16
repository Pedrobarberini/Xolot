import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react-native";
import { Image, Modal, PanResponder, Pressable, Text, View } from "react-native";
import { Circle, Defs, Mask, Rect, Svg } from "react-native-svg";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { ProfileAvatar } from "../types";
import {
  AvatarPreviewSize,
  AvatarSourceSize,
  getAvatarCropGeometry,
  getAvatarFocusFromCropPoint
} from "../utils/avatarFocus";

const DEFAULT_PREVIEW_SIZE = { height: 280, width: 324 };
const CROP_MASK_ID = "nextstar-avatar-crop-mask";

function getStoredSourceSize(avatar: ProfileAvatar): AvatarSourceSize {
  return {
    height: avatar.sourceHeight ?? 1,
    width: avatar.sourceWidth ?? 1
  };
}

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
  const [previewSize, setPreviewSize] =
    useState<AvatarPreviewSize>(DEFAULT_PREVIEW_SIZE);
  const [sourceSize, setSourceSize] = useState<AvatarSourceSize>(() =>
    avatar ? getStoredSourceSize(avatar) : { height: 1, width: 1 }
  );
  const previewSizeRef = useRef(previewSize);
  const sourceSizeRef = useRef(sourceSize);

  const updateFocusFromPoint = useCallback((x: number, y: number) => {
    const nextFocus = getAvatarFocusFromCropPoint(
      x,
      y,
      previewSizeRef.current,
      sourceSizeRef.current
    );

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
    if (!visible || !avatar) {
      return;
    }

    setFocusX(avatar.focusX);
    setFocusY(avatar.focusY);

    if (avatar.sourceWidth && avatar.sourceHeight) {
      const nextSourceSize = getStoredSourceSize(avatar);
      sourceSizeRef.current = nextSourceSize;
      setSourceSize(nextSourceSize);
      return;
    }

    let isMounted = true;

    Image.getSize(
      avatar.uri,
      (width, height) => {
        if (isMounted && width > 0 && height > 0) {
          const nextSourceSize = { height, width };
          sourceSizeRef.current = nextSourceSize;
          setSourceSize(nextSourceSize);
        }
      },
      () => undefined
    );

    return () => {
      isMounted = false;
    };
  }, [avatar, visible]);

  if (!avatar) {
    return null;
  }

  const cropGeometry = getAvatarCropGeometry(
    focusX,
    focusY,
    previewSize,
    sourceSize
  );

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
                Arraste o circulo sobre a foto
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
            accessibilityLabel="Recorte circular da foto"
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
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={{ uri: avatar.uri }}
              style={styles.avatarPositionFullImage}
            />
            <Svg
              height="100%"
              pointerEvents="none"
              style={styles.avatarPositionCropOverlay}
              width="100%"
            >
              <Defs>
                <Mask id={CROP_MASK_ID} maskUnits="userSpaceOnUse">
                  <Rect
                    fill="#FFFFFF"
                    height={previewSize.height}
                    width={previewSize.width}
                    x={0}
                    y={0}
                  />
                  <Circle
                    cx={cropGeometry.circleX}
                    cy={cropGeometry.circleY}
                    fill="#000000"
                    r={cropGeometry.circleRadius}
                  />
                </Mask>
              </Defs>
              <Rect
                fill="rgba(3, 12, 8, 0.62)"
                height={cropGeometry.imageHeight}
                mask={`url(#${CROP_MASK_ID})`}
                width={cropGeometry.imageWidth}
                x={cropGeometry.imageX}
                y={cropGeometry.imageY}
              />
              <Circle
                cx={cropGeometry.circleX}
                cy={cropGeometry.circleY}
                fill="transparent"
                r={cropGeometry.circleRadius}
                stroke="#FFFFFF"
                strokeWidth={3}
              />
              <Circle
                cx={cropGeometry.circleX}
                cy={cropGeometry.circleY}
                fill={colors.primary}
                r={5}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            </Svg>
          </View>

          <View style={styles.avatarPositionActions}>
            <Pressable onPress={onClose} style={styles.avatarPositionCancelButton}>
              <Text style={styles.avatarPositionCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave({ ...avatar, focusX, focusY })}
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
