import { StyleSheet } from "react-native";
import { baseStyles } from "./app/baseStyles";
import { authStyles } from "./app/authStyles";
import { navigationStyles } from "./app/navigationStyles";
import { feedStyles } from "./app/feedStyles";
import { sharedContentStyles } from "./app/sharedContentStyles";
import { mediaDetailStyles } from "./app/mediaDetailStyles";
import { submissionAdminStyles } from "./app/submissionAdminStyles";
import { walletInvestmentStyles } from "./app/walletInvestmentStyles";
import { profileStyles } from "./app/profileStyles";
import { accountAvatarSettingsStyles } from "./app/accountAvatarSettingsStyles";
import { discoveryMessagesStyles } from "./app/discoveryMessagesStyles";

export const styles = StyleSheet.create({
  ...baseStyles,
  ...authStyles,
  ...navigationStyles,
  ...feedStyles,
  ...sharedContentStyles,
  ...mediaDetailStyles,
  ...submissionAdminStyles,
  ...walletInvestmentStyles,
  ...profileStyles,
  ...accountAvatarSettingsStyles,
  ...discoveryMessagesStyles
});
