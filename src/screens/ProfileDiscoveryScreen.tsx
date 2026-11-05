import { BRAND } from "../config/brand.ts";
import React, { useMemo, useState } from "react";
import { BadgeCheck, ChevronRight, Search, X } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  AppUser,
  Player,
  ProfessionalSettingsByUser,
  ProfileAvatarsByProfile
} from "../types";
import { formatProfileActivity } from "../utils/profileActivity";
import { getProfessionalCategoryLabel } from "../utils/professional";
import {
  filterFollowedProfiles,
  matchesProfileSearch,
  normalizeProfileSearchValue
} from "../utils/profileSearch";
import { rankProfileSuggestions } from "../utils/profileSuggestions";

type SearchMode = "following" | "suggestions";

type SearchProfile = {
  city: string;
  id: string;
  matchingTags?: string[];
  meta: string;
  name: string;
  player?: Player;
  professionalLabel?: string;
  profileId: string;
  searchableText: string;
  suggestionScore?: number;
  suggestionSource?: "affinity" | "nearby" | "discovery";
  tags: string[];
  user?: AppUser;
  username?: string;
};


export function SearchScreen({
  followingProfileIds,
  interestedContentKeys,
  onOpenUser,
  ownProfileId,
  players,
  professionalSettingsByUser,
  profileAvatars,
  users,
  viewerCity,
  viewerInterestTags
}: {
  followingProfileIds: string[];
  interestedContentKeys: Set<string>;
  onOpenUser: (user: AppUser) => void;
  ownProfileId?: string | null;
  players: Player[];
  professionalSettingsByUser: ProfessionalSettingsByUser;
  profileAvatars: ProfileAvatarsByProfile;
  users: AppUser[];
  viewerCity: string;
  viewerInterestTags: string[];
}) {
  const [mode, setMode] = useState<SearchMode>("suggestions");
  const [query, setQuery] = useState("");
  const allProfiles = useMemo(() => {
    const userAccounts = users.filter((account) => account.role !== "Admin");
    const registeredProfiles: SearchProfile[] = userAccounts.map((account) => {
      const accountPlayers = players.filter(
        (player) =>
          player.ownerUserId === account.id ||
          player.profileId === `profile-${account.id}`
      );
      const player = accountPlayers[0];
      const professionalSettings = professionalSettingsByUser[account.id];
      const meta = account.profileCompleted
        ? formatProfileActivity(account.sport, account.position, account.city)
        : player
          ? formatProfileActivity(player.sport, player.position, player.city)
          : `Usuário ${BRAND.name} | Sem publicações`;

      return {
        id: `account-${account.id}`,
        city: account.city,
        meta,
        name: account.name,
        player,
        professionalLabel: professionalSettings?.enabled
          ? getProfessionalCategoryLabel(professionalSettings.category)
          : undefined,
        profileId: player?.profileId ?? `profile-${account.id}`,
        searchableText: [
          account.name,
          account.username,
          `@${account.username}`,
          account.bio,
          account.position,
          account.sport,
          account.city,
          account.club,
          ...account.interestTags,
          professionalSettings?.enabled
            ? getProfessionalCategoryLabel(professionalSettings.category)
            : "",
        ].filter(Boolean).join(" "),
        tags: account.interestTags,
        user: account,
        username: account.username
      };
    });
    return registeredProfiles;
  }, [players, professionalSettingsByUser, users]);
  const followingProfiles = useMemo(
    () => filterFollowedProfiles(allProfiles, followingProfileIds),
    [allProfiles, followingProfileIds]
  );
  const suggestedProfiles = useMemo(() => {
    const followingSet = new Set(followingProfileIds);
    return rankProfileSuggestions(
      allProfiles.filter(
        (profile) =>
          profile.profileId !== ownProfileId &&
          !followingSet.has(profile.profileId)
      ),
      interestedContentKeys,
      {
        currentCity: viewerCity,
        profileInterestTags: viewerInterestTags,
        rotationSeed: new Date().toISOString().slice(0, 10)
      }
    );
  }, [
    allProfiles,
    followingProfileIds,
    interestedContentKeys,
    ownProfileId,
    viewerCity,
    viewerInterestTags
  ]);
  const normalizedQuery = normalizeProfileSearchValue(query);
  const profiles = normalizedQuery
    ? allProfiles.filter((profile) => profile.profileId !== ownProfileId)
    : mode === "following"
      ? followingProfiles
      : suggestedProfiles;
  const filteredProfiles = normalizedQuery
    ? profiles.filter((profile) =>
        matchesProfileSearch(normalizedQuery, [profile.searchableText])
      )
    : profiles;

  return (
    <ScrollView
      contentContainerStyle={styles.discoveryContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.discoveryHeader}>
        <Text style={styles.discoveryTitle}>Descobrir perfis</Text>
        <Text style={styles.discoverySubtitle}>
          Descubra contas por interesses em comum e proximidade regional.
        </Text>
      </View>

      <View accessibilityRole="tablist" style={styles.searchModeControl}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === "following" }}
          onPress={() => setMode("following")}
          style={[
            styles.searchModeTab,
            mode === "following" ? styles.searchModeTabActive : null
          ]}
        >
          <Text
            style={[
              styles.searchModeTabText,
              mode === "following" ? styles.searchModeTabTextActive : null
            ]}
          >
            Seguindo
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === "suggestions" }}
          onPress={() => setMode("suggestions")}
          style={[
            styles.searchModeTab,
            mode === "suggestions" ? styles.searchModeTabActive : null
          ]}
        >
          <Text
            style={[
              styles.searchModeTabText,
              mode === "suggestions" ? styles.searchModeTabTextActive : null
            ]}
          >
            Sugestões
          </Text>
        </Pressable>
      </View>

      {mode === "suggestions" && viewerInterestTags.length > 0 ? (
        <View style={styles.searchInterestSection}>
          <View style={styles.searchInterestHeader}>
            <Text style={styles.searchInterestTitle}>
              Afinidades do seu perfil
            </Text>
            <Text style={styles.searchInterestCount}>
              {viewerInterestTags.length} de 6
            </Text>
          </View>
          <View style={styles.searchTagList}>
            {viewerInterestTags.map((tag) => (
              <View key={tag} style={[styles.searchTag, styles.searchTagSelected]}>
                <Text style={[styles.searchTagText, styles.searchTagTextSelected]}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.searchField}>
        <Search color={colors.muted} size={19} />
        <TextInput
          accessibilityLabel="Pesquisar perfis"
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Nome, @username, hashtag, cidade ou área"
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
          {normalizedQuery
            ? "Resultados"
            : mode === "following"
              ? "Seguindo"
              : "Sugestões para você"}
        </Text>
        <Text style={styles.searchResultsCount}>{filteredProfiles.length}</Text>
      </View>

      {filteredProfiles.length === 0 ? (
        <View style={styles.discoveryEmptyState}>
          <Search color={colors.muted} size={28} />
          <Text style={styles.discoveryEmptyTitle}>
            {normalizedQuery
              ? "Nenhum perfil encontrado"
              : mode === "following"
                ? "Você ainda não segue nenhum perfil"
                : "Ainda não há perfis para sugerir"}
          </Text>
          <Text style={styles.discoveryEmptyBody}>
            {normalizedQuery
              ? "Tente pesquisar por outro nome, @username ou hashtag."
              : mode === "following"
                ? "Abra Sugestões para descobrir novos perfis."
                : "Novas contas cadastradas aparecerão aqui automaticamente."}
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
          const suggestionLabel = profile.matchingTags?.length
            ? `Combina com ${profile.matchingTags
                .slice(0, 3)
                .map((tag) => `#${tag}`)
                .join(" ")}`
            : profile.suggestionSource === "nearby"
              ? "Perfil da sua região"
              : profile.suggestionSource === "discovery"
                ? "Novo perfil para descobrir"
                : "Interesses em comum";
          const badgeLabel =
            profile.professionalLabel ??
            (mode === "suggestions"
              ? suggestionLabel
              : "Perfil que você segue");

          return (
            <Pressable
              accessibilityLabel={`Abrir perfil de ${profile.name}`}
              key={profile.id}
              onPress={() => profile.user && onOpenUser(profile.user)}
              style={({ pressed }) => [
                styles.searchProfileRow,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <View style={styles.searchProfileAvatar}>
                {profileAvatars[profile.profileId] ? (
                  <ProfileAvatarImage avatar={profileAvatars[profile.profileId]} />
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
                <View style={styles.searchProfileBadgeRow}>
                  {profile.professionalLabel ? (
                    <BadgeCheck color={colors.primaryText} size={13} />
                  ) : null}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.searchProfileBadge,
                      profile.professionalLabel || profile.suggestionScore
                        ? styles.searchProfileBadgeActive
                        : null
                    ]}
                  >
                    {badgeLabel}
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.muted} size={20} />
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}
