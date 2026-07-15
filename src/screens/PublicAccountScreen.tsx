import React from "react";
import { ArrowLeft, UserRound, Video } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser } from "../types";
import { formatBRL } from "../utils/investment";

export function PublicAccountScreen({
  account,
  onBack,
  walletBalance
}: {
  account: AppUser;
  onBack: () => void;
  walletBalance: number;
}) {
  const initials = account.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View style={styles.publicAccountShell}>
      <ScrollView contentContainerStyle={styles.publicAccountContent}>
        <View style={styles.publicAccountIdentity}>
          <View style={styles.publicAccountAvatar}>
            {initials ? (
              <Text style={styles.publicAccountAvatarText}>{initials}</Text>
            ) : (
              <UserRound color={colors.primary} size={30} />
            )}
          </View>
          <Text style={styles.publicAccountName}>{account.name}</Text>
          <Text style={styles.publicAccountMeta}>Perfil NextStar</Text>
        </View>

        <View style={styles.publicAccountEmpty}>
          <View style={styles.publicAccountEmptyIcon}>
            <Video color={colors.primary} size={25} />
          </View>
          <Text style={styles.publicAccountEmptyTitle}>
            Nenhum video publicado
          </Text>
          <Text style={styles.publicAccountEmptyBody}>
            Este usuario ainda nao possui videos aprovados para mostrar no
            perfil.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.detailFixedHud}>
        <Pressable
          accessibilityLabel="Voltar a pesquisa"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onBack}
          style={styles.detailHudBackButton}
        >
          <ArrowLeft color={colors.text} size={21} strokeWidth={2.1} />
        </Pressable>
        <Text
          accessibilityLabel={`Saldo disponivel ${formatBRL(walletBalance)}`}
          numberOfLines={1}
          style={styles.detailHudBalance}
        >
          {formatBRL(walletBalance)}
        </Text>
      </View>
    </View>
  );
}
