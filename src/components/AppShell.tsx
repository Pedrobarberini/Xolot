import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, View } from "react-native";
import { XOLOT_WORDMARK } from "../constants/assets";
import { styles } from "../styles/appStyles";

export function BrandLaunchScreen({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    let isMounted = true;
    let animation: Animated.CompositeAnimation | null = null;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (!isMounted) {
          return;
        }

        animation = reduceMotion
          ? Animated.sequence([
              Animated.delay(500),
              Animated.timing(opacity, {
                duration: 180,
                toValue: 0,
                useNativeDriver: true
              })
            ])
          : Animated.sequence([
              Animated.timing(scale, {
                duration: 420,
                easing: Easing.out(Easing.cubic),
                toValue: 1,
                useNativeDriver: true
              }),
              Animated.delay(650),
              Animated.timing(opacity, {
                duration: 330,
                easing: Easing.inOut(Easing.cubic),
                toValue: 0,
                useNativeDriver: true
              })
            ]);

        animation.start(({ finished }) => {
          if (finished && isMounted) {
            onFinish();
          }
        });
      })
      .catch(() => onFinish());

    return () => {
      isMounted = false;
      animation?.stop();
    };
  }, [onFinish, opacity, scale]);

  return (
    <Animated.View
      accessibilityLabel="Carregando Xolot"
      accessibilityRole="progressbar"
      style={[styles.brandLaunch, { opacity }]}
    >
      <Animated.Image
        resizeMode="contain"
        source={XOLOT_WORDMARK}
        style={[styles.brandLaunchLogo, { transform: [{ scale }] }]}
      />
    </Animated.View>
  );
}

export function ScreenBackdrop({
  backgroundColor
}: {
  backgroundColor?: string;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.screenBackdrop,
        backgroundColor ? { backgroundColor } : null
      ]}
    />
  );
}

export function ScreenTransition({
  children,
  style
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);

    const animation = Animated.timing(progress, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true
    });

    animation.start();

    return () => animation.stop();
  }, [progress]);

  return (
    <Animated.View style={[style, { opacity: progress }]}>
      {children}
    </Animated.View>
  );
}

export function ScreenFrame({
  animated = true,
  backgroundColor,
  children
}: {
  animated?: boolean;
  backgroundColor?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.tabScene,
        backgroundColor ? { backgroundColor } : null
      ]}
    >
      <ScreenBackdrop backgroundColor={backgroundColor} />
      {animated ? (
        <ScreenTransition style={styles.tabSceneContent}>
          {children}
        </ScreenTransition>
      ) : (
        children
      )}
    </View>
  );
}
