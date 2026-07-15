import React from "react";
import { MessageCircle, Search } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";

export function MessagesScreen({
  onFindProfiles
}: {
  onFindProfiles: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.messagesContent}>
      <View style={styles.discoveryHeader}>
        <Text style={styles.discoveryTitle}>Mensagens</Text>
        <Text style={styles.discoverySubtitle}>
          Suas conversas com atletas e outros perfis ficarao reunidas aqui.
        </Text>
      </View>

      <View style={styles.messagesEmptyState}>
        <View style={styles.messagesIcon}>
          <MessageCircle color={colors.primary} size={30} />
        </View>
        <Text style={styles.discoveryEmptyTitle}>Nenhuma conversa ainda</Text>
        <Text style={styles.discoveryEmptyBody}>
          O sistema de mensagens ainda nao possui conversas para esta conta.
          Encontre um perfil para continuar explorando o NextStar.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onFindProfiles}
          style={({ pressed }) => [
            styles.messagesSearchButton,
            pressed ? styles.buttonPressed : null
          ]}
        >
          <Search color={colors.onPrimary} size={18} />
          <Text style={styles.messagesSearchButtonText}>Pesquisar perfis</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
