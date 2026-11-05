import React from "react";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { styles } from "./BackButton.styles";
import { useThemeColors } from "../theme/context";

export type BackButtonProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  inverse?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function BackButton({
  accessibilityLabel,
  disabled = false,
  inverse = false,
  onPress,
  style,
}: BackButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.backIconButton,
        style,
        pressed ? styles.backIconButtonPressed : null,
        disabled ? styles.backIconButtonDisabled : null,
      ]}
    >
      <ArrowLeft color={inverse ? colors.onPrimary : colors.text} size={22} strokeWidth={2.2} />
    </Pressable>
  );
}
