import React, { useMemo } from "react";
import { Text, TextInput, View } from "react-native";
import { createLabeledInputStyles } from "./LabeledInput.styles";
import { useThemeColors } from "../theme/context";

export type LabeledInputProps = React.ComponentProps<typeof TextInput> & { label: string };

export function LabeledInput({ label, multiline, ...props }: LabeledInputProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createLabeledInputStyles(colors), [colors]);
  return (
    <View style={styles.labeledInputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={[styles.formInput, multiline ? styles.formInputMultiline : null]}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </View>
  );
}
