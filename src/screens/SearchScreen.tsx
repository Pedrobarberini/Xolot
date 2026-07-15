import React, { useMemo, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AthleteFund, Player } from "../types";

export function SearchScreen({
  funds,
  onOpenPlayer,
  players
}: {
  funds: AthleteFund[];
  onOpenPlayer: (player: Player) => void;
  players: Player[];
}) {
  const [query, setQuery] = useState("");
  const profiles = useMemo(
    () => Array.from(new Map(players.map((player) => [player.profileId, player])).values()),
    [players]
  );
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredProfiles = normalizedQuery
    ? profiles.filter((player) =>
        [player.name, player.position, player.city, player.club]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedQuery)
      )
    : profiles;

  return (
    <ScrollView
      contentContainerStyle={styles.discoveryContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.discoveryHeader}>
        <Text style={styles.discoveryTitle}>Pesquisar perfis</Text>
        <Text style={styles.discoverySubtitle}>
          Encontre atletas por nome, posicao, cidade ou clube.
        </Text>
      </View>

      <View style={styles.searchField}>
        <Search color={colors.muted} size={19} />
        <TextInput
          accessibilityLabel="Pesquisar perfis"
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Nome, posicao, cidade ou clube"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
        />
        {query ? (
          <Pressable
            accessibilityLabel="Limpar pesquisa"
            hitSlop={8}
            onPress={() => setQuery("")}
            style={styles.searchClearButton}
          >
            <X color={colors.text} size={17} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.searchResultsHeader}>
        <Text style={styles.searchResultsTitle}>
          {normalizedQuery ? "Resultados" : "Perfis disponiveis"}
        </Text>
        <Text style={styles.searchResultsCount}>{filteredProfiles.length}</Text>
      </View>

      {filteredProfiles.length === 0 ? (
        <View style={styles.discoveryEmptyState}>
          <Search color={colors.muted} size={28} />
          <Text style={styles.discoveryEmptyTitle}>Nenhum perfil encontrado</Text>
          <Text style={styles.discoveryEmptyBody}>
            Tente pesquisar com outro nome, cidade, posicao ou clube.
          </Text>
        </View>
      ) : (
        filteredProfiles.map((player) => {
          const initials = player.name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();
          const fund = funds.find((item) => item.profileId === player.profileId);

          return (
            <Pressable
              accessibilityLabel={`Abrir perfil de ${player.name}`}
              key={player.profileId}
              onPress={() => onOpenPlayer(player)}
              style={({ pressed }) => [
                styles.searchProfileRow,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <View style={styles.searchProfileAvatar}>
                <Text style={styles.searchProfileAvatarText}>{initials}</Text>
              </View>
              <View style={styles.searchProfileBody}>
                <Text numberOfLines={1} style={styles.searchProfileName}>
                  {player.name}
                </Text>
                <Text numberOfLines={1} style={styles.searchProfileMeta}>
                  {player.position} | {player.city}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.searchProfileFund,
                    fund ? styles.searchProfileFundActive : null
                  ]}
                >
                  {fund
                    ? fund.status === "Captando"
                      ? "Bolsa de investimento aberta"
                      : "Meta de investimento concluida"
                    : "Este perfil nao possui investimento aberto"}
                </Text>
              </View>
              <ChevronRight color={colors.muted} size={20} />
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}
