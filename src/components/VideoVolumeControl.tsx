import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react-native";
import { PanResponder, Pressable, View } from "react-native";
import { getPointerLocationY } from "../actions/appActions";
import { styles } from "../styles/appStyles";

export function VideoVolumeControl({
  active = true,
  muted,
  onChange,
  volume
}: {
  active?: boolean;
  muted: boolean;
  onChange: (volume: number) => void;
  volume: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [trackHeight, setTrackHeight] = useState(0);
  const effectiveVolume = muted ? 0 : volume;
  const trackHeightRef = useRef(trackHeight);
  const effectiveVolumeRef = useRef(effectiveVolume);
  const onChangeRef = useRef(onChange);
  const setVolumeFromOffsetRef = useRef<(offsetY: number) => void>(
    () => undefined
  );

  trackHeightRef.current = trackHeight;
  effectiveVolumeRef.current = effectiveVolume;
  onChangeRef.current = onChange;
  setVolumeFromOffsetRef.current = (offsetY: number) => {
    const height = trackHeightRef.current;

    if (height <= 0) {
      return;
    }

    const nextVolume = 1 - Math.min(Math.max(offsetY / height, 0), 1);
    onChangeRef.current(nextVolume);
  };

  const volumePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (event) => {
        const locationY = getPointerLocationY(event.nativeEvent);

        if (locationY !== null) {
          setVolumeFromOffsetRef.current(locationY);
        }
      },
      onPanResponderMove: (event) => {
        const locationY = getPointerLocationY(event.nativeEvent);

        if (locationY !== null) {
          setVolumeFromOffsetRef.current(locationY);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true
    })
  ).current;
  const thumbOffset =
    trackHeight > 10
      ? Math.min(
          Math.max(effectiveVolume * trackHeight - 5, 0),
          trackHeight - 10
        )
      : 0;

  useEffect(() => {
    if (!active) {
      setIsVisible(false);
    }
  }, [active]);

  return (
    <View style={styles.feedVideoVolumeControl}>
      <Pressable
        accessibilityLabel={
          isVisible ? "Fechar controle de volume" : "Abrir controle de volume"
        }
        accessibilityRole="button"
        onPress={() => setIsVisible((current) => !current)}
        style={styles.feedVideoControlButton}
      >
        {muted || effectiveVolume === 0 ? (
          <VolumeX color="#FFFFFF" size={20} />
        ) : (
          <Volume2 color="#FFFFFF" size={20} />
        )}
      </Pressable>
      {isVisible ? (
        <View style={styles.feedVideoVolumeSlider}>
          <View
            accessibilityActions={[
              { label: "Aumentar volume", name: "increment" },
              { label: "Diminuir volume", name: "decrement" }
            ]}
            accessibilityLabel="Volume do vídeo"
            accessibilityRole="adjustable"
            accessibilityValue={{
              max: 100,
              min: 0,
              now: Math.round(effectiveVolume * 100),
              text: `${Math.round(effectiveVolume * 100)}%`
            }}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === "increment") {
                onChangeRef.current(effectiveVolumeRef.current + 0.1);
              }

              if (event.nativeEvent.actionName === "decrement") {
                onChangeRef.current(effectiveVolumeRef.current - 0.1);
              }
            }}
            onLayout={(event) => {
              const nextHeight = event.nativeEvent.layout.height;

              trackHeightRef.current = nextHeight;
              setTrackHeight(nextHeight);
            }}
            style={styles.feedVideoVolumePressable}
            {...volumePanResponder.panHandlers}
          >
            <View pointerEvents="none" style={styles.feedVideoVolumeTrack}>
              <View
                style={[
                  styles.feedVideoVolumeFill,
                  { height: `${effectiveVolume * 100}%` }
                ]}
              />
            </View>
            <View
              pointerEvents="none"
              style={[styles.feedVideoVolumeThumb, { bottom: thumbOffset }]}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
