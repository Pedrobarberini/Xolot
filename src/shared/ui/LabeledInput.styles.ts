import { StyleSheet } from "react-native";
import type { ThemeColors } from "../theme/tokens";

export function createLabeledInputStyles(colors: ThemeColors) {
  return StyleSheet.create({
    labeledInputBlock: { marginTop: 10 },
    inputLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "900",
      marginBottom: 6,
      textTransform: "uppercase",
    },
    formInput: {
      backgroundColor: colors.surface,
      borderColor: colors.borderStrong,
      borderRadius: 8,
      borderWidth: 1,
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      minHeight: 48,
      paddingHorizontal: 12,
    },
    formInputMultiline: { lineHeight: 20, minHeight: 94, paddingTop: 12 },
  });
}
