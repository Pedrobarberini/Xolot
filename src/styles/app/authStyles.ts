import { colors } from "../../theme";

export const authStyles = {
  authShell: {
    backgroundColor: colors.background,
    flex: 1,
    overflow: "hidden"
  },
  authContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    maxWidth: 520,
    alignSelf: "center",
    width: "100%"
  },
  authCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    padding: 20,
    shadowColor: "#1B160A",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    width: "100%"
  },
  authTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  authPanelKicker: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  authModePill: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  authModeText: {
    color: colors.primaryText,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  authEyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center",
    textTransform: "uppercase"
  },
  authTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 10,
    marginBottom: 10
  },
  authHelperText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 8
  },
  authPasswordRequirements: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8
  },
  authPasswordRequirement: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5
  },
  authPasswordRequirementIcon: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 7,
    borderWidth: 1,
    height: 14,
    justifyContent: "center",
    width: 14
  },
  authPasswordRequirementIconMet: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  authPasswordRequirementText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700"
  },
  authPasswordRequirementTextMet: {
    color: colors.primaryText
  },
  authFieldErrorText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
    marginTop: 6
  },
  authErrorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: 12
  },
  authSuccessText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: 12
  },
  authInlineAction: {
    alignSelf: "flex-end",
    paddingVertical: 8
  },
  authInlineActionText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "800"
  },
  authSocialRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%"
  },
  authSocialButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: 12
  },
  authSocialButtonDisabled: {
    opacity: 0.48
  },
  authSocialButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  authSocialIcon: {
    height: 21,
    resizeMode: "contain",
    width: 21
  },
  authGoogleConfirmation: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    padding: 14
  },
  authGoogleConfirmationIcon: {
    height: 28,
    resizeMode: "contain",
    width: 28
  },
  authGoogleConfirmationCopy: {
    flex: 1,
    minWidth: 0
  },
  authGoogleConfirmationTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  authGoogleConfirmationEmail: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  authDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 2,
    marginTop: 14
  },
  authDividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1
  },
  authDividerText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  checkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  checkBox: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  checkBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checkText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  }
} as const;
