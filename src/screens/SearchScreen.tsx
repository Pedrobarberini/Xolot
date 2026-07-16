import React, { useMemo, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import {
  AppUser,
  AthleteFund,
  Player,
  ProfileAvatarsByProfile
} from "../types";

type SearchProfile = {
  fund?: AthleteFund;
  id: string;
  meta: string;
  name: string;
  player?: Player;
  profileId: string;
  searchableText: string;
  user?: AppUser;
  username?: string;
};

export function SearchScreen({
  funds,
  onOpenPlayer,
  onOpenUser,
  players,
  profileAvatars,
  users
}: {
  funds: AthleteFund[];
  onOpenPlayer: (player: Player) => void;
  onOpenUser: (user: AppUser) => void;
  players: Player[];
  profileAvatars: ProfileAvatarsByProfile;
  users: AppUser[];
}) {
  const [query, setQuery] = useState("");
  const profiles = useMemo(
    () => {
      const uniquePlayers = Array.from(
        new Map(players.map((player) => [player.profileId, player])).values()
      );
      const userAccounts = users.filter((account) => account.role === "Usuario");
      const userIds = new Set(userAccounts.map((account) => account.id));
      const registeredProfiles: SearchProfile[] = userAccounts.map((account) => {
        const player = uniquePlayers.find(
          (item) => item.ownerUserId === account.id
        );
        const fund = player
          ? funds.find((item) => item.profileId === player.profileId)
          : undefined;
        const meta = account.profileCompleted
          ? `${account.position} | ${account.city}`
          : player
            ? `${player.position} | ${player.city}`
            : "Usuario NextStar | Sem videos publicados";

        return {
          fund,
          id: `account-${account.id}`,
          meta,
          name: player?.name ?? account.name,
          player,
          profileId: player?.profileId ?? `profile-${account.id}`,
          searchableText: [
            account.name,
            account.username,
            `@${account.username}`,
            account.bio,
            account.position,
            account.city,
            account.club,
            player?.name,
            player?.position,
            player?.city,
            player?.club
          ]
            .filter(Boolean)
            .join(" "),
          user: account,
          username: account.username
        };
      });
      const standaloneProfiles: SearchProfile[] = uniquePlayers
        .filter(
          (player) => !player.ownerUserId || !userIds.has(player.ownerUserId)
        )
        .map((player) => ({
          fund: funds.find((item) => item.profileId === player.profileId),
          id: `player-${player.profileId}`,
          meta: `${player.position} | ${player.city}`,
          name: player.name,
          player,
          profileId: player.profileId,
          searchableText: [
            player.name,
            player.username,
            player.position,
            player.city,
            player.club
          ].filter(Boolean).join(" "),
          username: player.username
        }));

      return [...registeredProfiles, ...standaloneProfiles];
    },
    [funds, players, users]
  );
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredProfiles = normalizedQuery
    ? profiles.filter((profile) =>
        profile.searchableText
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
          Encontre atletas por nome, @usuario, posicao, cidade ou clube.
        </Text>
      </View>

      <View style={styles.searchField}>
        <Search color={colors.muted} size={19} />
        <TextInput
          accessibilityLabel="Pesquisar perfis"
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Nome, @usuario, posicao, cidade ou clube"
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
        filteredProfiles.map((profile) => {
          const initials = profile.name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();

          return (
            <Pressable
              accessibilityLabel={`Abrir perfil de ${profile.name}`}
              key={profile.id}
              onPress={() => {
                if (profile.player) {
                  onOpenPlayer(profile.player);
                  return;
                }

                if (profile.user) {
                  onOpenUser(profile.user);
                }
              }}
              style={({ pressed }) => [
                styles.searchProfileRow,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <View style={styles.searchProfileAvatar}>
                {profileAvatars[profile.profileId] ? (
                  <ProfileAvatarImage
                    avatar={profileAvatars[profile.profileId]}
                  />
                ) : (
                  <Text style={styles.searchProfileAvatarText}>{initials}</Text>
                )}
              </View>
              <View style={styles.searchProfileBody}>
                <Text numberOfLines={1} style={styles.searchProfileName}>
                  {profile.name}
                </Text>
                {profile.username ? (
                  <Text numberOfLines={1} style={styles.searchProfileUsername}>
                    @{profile.username}
                  </Text>
                ) : null}
                <Text numberOfLines={1} style={styles.searchProfileMeta}>
                  {profile.meta}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.searchProfileFund,
                    profile.fund ? styles.searchProfileFundActive : null
                  ]}
                >
                  {profile.fund
                    ? profile.fund.status === "Captando"
                      ? "Bolsa de investimento aberta"
                      : "Meta de investimento concluida"
                    : profile.player
                      ? "Este perfil nao possui investimento aberto"
                      : "Perfil cadastrado"}
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
