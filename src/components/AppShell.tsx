import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, View } from "react-native";
import { NEXTSTAR_WORDMARK } from "../constants/assets";
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
      accessibilityLabel="Carregando NextStar"
      accessibilityRole="progressbar"
      style={[styles.brandLaunch, { opacity }]}
    >
      <Animated.Image
        resizeMode="contain"
        source={NEXTSTAR_WORDMARK}
        style={[styles.brandLaunchLogo, { transform: [{ scale }] }]}
      />
    </Animated.View>
  );
}

export function ScreenBackdrop() {
  return <View pointerEvents="none" style={styles.screenBackdrop} />;
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

    Animated.timing(progress, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0]
              })
            }
          ]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function ScreenFrame({
  animated = true,
  children
}: {
  animated?: boolean;
  children: React.ReactNode;
}) {
  if (!animated) {
    return (
      <View style={styles.tabScene}>
        <ScreenBackdrop />
        {children}
      </View>
    );
  }

  return (
    <ScreenTransition style={styles.tabScene}>
      <ScreenBackdrop />
      {children}
    </ScreenTransition>
  );
}
