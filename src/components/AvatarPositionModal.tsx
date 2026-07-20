import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react-native";
import {
  Image,
  Modal,
  PanResponder,
  Pressable,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { Circle, Defs, Mask, Rect, Svg } from "react-native-svg";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { ProfileAvatar } from "../types";
import {
  AvatarPreviewSize,
  AvatarSourceSize,
  DEFAULT_AVATAR_CROP_SCALE,
  MAX_AVATAR_CROP_SCALE,
  MIN_AVATAR_CROP_SCALE,
  getAvatarCropGeometry,
  getAvatarCropScaleFromPinch,
  getAvatarCropScaleFromTrackPosition,
  getAvatarCropTrackPosition,
  getAvatarFocusFromCropPoint,
  getAvatarPinchDistance,
  normalizeAvatarCropScale
} from "../utils/avatarFocus";

const DEFAULT_PREVIEW_SIZE = { height: 280, width: 324 };
const DEFAULT_CROP_TRACK_WIDTH = 180;
const CROP_SCALE_STEP = 0.05;
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
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [focusX, setFocusX] = useState(50);
  const [focusY, setFocusY] = useState(50);
  const [cropScale, setCropScale] = useState(DEFAULT_AVATAR_CROP_SCALE);
  const [cropTrackWidth, setCropTrackWidth] = useState(
    DEFAULT_CROP_TRACK_WIDTH
  );
  const [previewSize, setPreviewSize] =
    useState<AvatarPreviewSize>(DEFAULT_PREVIEW_SIZE);
  const [sourceSize, setSourceSize] = useState<AvatarSourceSize>(() =>
    avatar ? getStoredSourceSize(avatar) : { height: 1, width: 1 }
  );
  const previewSizeRef = useRef(previewSize);
  const sourceSizeRef = useRef(sourceSize);
  const cropScaleRef = useRef(cropScale);
  const cropTrackWidthRef = useRef(cropTrackWidth);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(cropScale);
  const isCompact = windowWidth < 420 || windowHeight < 700;
  const previewHeight = Math.min(
    280,
    Math.max(180, windowHeight - 340),
    Math.max(180, windowWidth - (isCompact ? 48 : 76))
  );

  const updateCropScale = useCallback((nextCropScale: number) => {
    const normalizedScale = normalizeAvatarCropScale(nextCropScale);

    cropScaleRef.current = normalizedScale;
    setCropScale(normalizedScale);
  }, []);

  const updateCropScaleFromPosition = useCallback(
    (positionX: number) => {
      updateCropScale(
        getAvatarCropScaleFromTrackPosition(
          positionX,
          cropTrackWidthRef.current
        )
      );
    },
    [updateCropScale]
  );

  const updateFocusFromPoint = useCallback((x: number, y: number) => {
    const nextFocus = getAvatarFocusFromCropPoint(
      x,
      y,
      cropScaleRef.current,
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
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (event) => {
          const pinchDistance = getAvatarPinchDistance(
            event.nativeEvent.touches
          );

          if (pinchDistance !== null) {
            pinchStartDistanceRef.current = pinchDistance;
            pinchStartScaleRef.current = cropScaleRef.current;
            return;
          }

          updateFocusFromPoint(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY
          );
        },
        onPanResponderMove: (event) => {
          const pinchDistance = getAvatarPinchDistance(
            event.nativeEvent.touches
          );

          if (pinchDistance !== null) {
            if (pinchStartDistanceRef.current === null) {
              pinchStartDistanceRef.current = pinchDistance;
              pinchStartScaleRef.current = cropScaleRef.current;
              return;
            }

            updateCropScale(
              getAvatarCropScaleFromPinch(
                pinchStartScaleRef.current,
                pinchStartDistanceRef.current,
                pinchDistance
              )
            );
            return;
          }

          pinchStartDistanceRef.current = null;
          updateFocusFromPoint(
            event.nativeEvent.locationX,
            event.nativeEvent.locationY
          );
        },
        onPanResponderRelease: () => {
          pinchStartDistanceRef.current = null;
        },
        onPanResponderTerminate: () => {
          pinchStartDistanceRef.current = null;
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true
      }),
    [updateCropScale, updateFocusFromPoint]
  );

  const cropScalePanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) =>
          updateCropScaleFromPosition(event.nativeEvent.locationX),
        onPanResponderMove: (event) =>
          updateCropScaleFromPosition(event.nativeEvent.locationX),
        onPanResponderTerminationRequest: () => false,
        onStartShouldSetPanResponder: () => true
      }),
    [updateCropScaleFromPosition]
  );

  useEffect(() => {
    if (!visible || !avatar) {
      return;
    }

    setFocusX(avatar.focusX);
    setFocusY(avatar.focusY);
    updateCropScale(avatar.cropScale);

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
  }, [avatar, updateCropScale, visible]);

  if (!avatar) {
    return null;
  }

  const cropGeometry = getAvatarCropGeometry(
    focusX,
    focusY,
    cropScale,
    previewSize,
    sourceSize
  );
  const cropScalePercent = Math.round(cropScale * 100);
  const cropThumbPosition = getAvatarCropTrackPosition(
    cropScale,
    cropTrackWidth
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
        <View
          accessibilityViewIsModal
          style={[
            styles.avatarPositionDialog,
            isCompact ? styles.avatarPositionDialogCompact : null
          ]}
        >
          <View style={styles.avatarPositionHeader}>
            <View style={styles.avatarPositionHeaderText}>
              <Text style={styles.avatarPositionTitle}>Ajustar enquadramento</Text>
              <Text style={styles.avatarPositionSubtitle}>
                Arraste para posicionar e use dois dedos para redimensionar
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
            style={[styles.avatarPositionPreview, { height: previewHeight }]}
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

          <View style={styles.avatarCropSizeSection}>
            <View style={styles.avatarCropSizeHeader}>
              <Text style={styles.avatarCropSizeLabel}>Tamanho do recorte</Text>
              <Text style={styles.avatarCropSizeValue}>
                {cropScalePercent}%
              </Text>
            </View>
            <View style={styles.avatarCropSizeControl}>
              <Pressable
                accessibilityLabel="Diminuir recorte"
                accessibilityRole="button"
                disabled={cropScale <= MIN_AVATAR_CROP_SCALE}
                onPress={() => updateCropScale(cropScale - CROP_SCALE_STEP)}
                style={styles.avatarCropSizeButton}
              >
                <Minus color={colors.text} size={18} />
              </Pressable>
              <View
                accessibilityActions={[
                  { label: "Aumentar", name: "increment" },
                  { label: "Diminuir", name: "decrement" }
                ]}
                accessibilityLabel="Tamanho do recorte"
                accessibilityRole="adjustable"
                accessibilityValue={{
                  max: 100,
                  min: 30,
                  now: cropScalePercent,
                  text: `${cropScalePercent}%`
                }}
                onAccessibilityAction={(event) => {
                  updateCropScale(
                    cropScale +
                      (event.nativeEvent.actionName === "increment"
                        ? CROP_SCALE_STEP
                        : -CROP_SCALE_STEP)
                  );
                }}
                onLayout={(event) => {
                  const nextWidth = event.nativeEvent.layout.width;

                  cropTrackWidthRef.current = nextWidth;
                  setCropTrackWidth(nextWidth);
                }}
                style={styles.avatarCropSizeTrack}
                {...cropScalePanResponder.panHandlers}
              >
                <View style={styles.avatarCropSizeRail} />
                <View
                  style={[
                    styles.avatarCropSizeFill,
                    { width: cropThumbPosition }
                  ]}
                />
                <View
                  style={[
                    styles.avatarCropSizeThumb,
                    { left: cropThumbPosition - 10 }
                  ]}
                />
              </View>
              <Pressable
                accessibilityLabel="Aumentar recorte"
                accessibilityRole="button"
                disabled={cropScale >= MAX_AVATAR_CROP_SCALE}
                onPress={() => updateCropScale(cropScale + CROP_SCALE_STEP)}
                style={styles.avatarCropSizeButton}
              >
                <Plus color={colors.text} size={18} />
              </Pressable>
            </View>
            <View style={styles.avatarCropSizeRange}>
              <Text style={styles.avatarCropSizeRangeText}>30%</Text>
              <Text style={styles.avatarCropSizeRangeText}>100%</Text>
            </View>
          </View>

          <View style={styles.avatarPositionActions}>
            <Pressable onPress={onClose} style={styles.avatarPositionCancelButton}>
              <Text style={styles.avatarPositionCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                onSave({ ...avatar, cropScale, focusX, focusY })
              }
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
