import React, { useMemo, useState } from "react";
import {
  EyeOff,
  Flag,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  UserRoundX,
  Video
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BackButton } from "../components/Navigation";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  AppUser,
  Player,
  ProfileAvatar,
  ProfileAvatarsByProfile
} from "../types";
import {
  getPlayerContentKey,
  getPlayerContentLabel
} from "../utils/feedEngagement";

type SecuritySection = "blocked" | "hidden" | "reported";

const sectionOptions: Array<{
  id: SecuritySection;
  label: string;
  Icon: typeof EyeOff;
}> = [
  { id: "hidden", label: "Ocultados", Icon: EyeOff },
  { id: "reported", label: "Denunciados", Icon: Flag },
  { id: "blocked", label: "Bloqueados", Icon: UserRoundX }
];

export function SecurityScreen({
  blockedProfileIds,
  hiddenPlayerIds,
  mutedContentKeys,
  onBack,
  onRestoreMutedContent,
  onRestorePlayer,
  onUnblockProfile,
  onWithdrawReport,
  players,
  profileAvatars,
  reportedPlayerIds,
  users
}: {
  blockedProfileIds: Set<string>;
  hiddenPlayerIds: Set<string>;
  mutedContentKeys: Set<string>;
  onBack: () => void;
  onRestoreMutedContent: (contentKey: string) => void;
  onRestorePlayer: (playerId: string) => void;
  onUnblockProfile: (profileId: string) => void;
  onWithdrawReport: (playerId: string) => void;
  players: Player[];
  profileAvatars: ProfileAvatarsByProfile;
  reportedPlayerIds: Set<string>;
  users: AppUser[];
}) {
  const [activeSection, setActiveSection] =
    useState<SecuritySection>("hidden");
  const hiddenPlayers = useMemo(
    () => buildPlayerEntries(hiddenPlayerIds, players),
    [hiddenPlayerIds, players]
  );
  const mutedContentPreferences = useMemo(
    () => buildMutedContentEntries(mutedContentKeys, players),
    [mutedContentKeys, players]
  );
  const reportedPlayers = useMemo(
    () => buildPlayerEntries(reportedPlayerIds, players),
    [players, reportedPlayerIds]
  );
  const blockedProfiles = useMemo(
    () =>
      [...blockedProfileIds].map((profileId) =>
        buildBlockedProfileEntry(profileId, players, users)
      ),
    [blockedProfileIds, players, users]
  );
  const counts: Record<SecuritySection, number> = {
    blocked: blockedProfiles.length,
    hidden: hiddenPlayers.length + mutedContentPreferences.length,
    reported: reportedPlayers.length
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.profileSubviewHeader}>
        <BackButton accessibilityLabel="Voltar ao perfil" onPress={onBack} />
        <Text style={styles.profileSubviewTitle}>Segurança</Text>
        <View style={styles.profileSubviewSpacer} />
      </View>

      <View accessibilityRole="tablist" style={styles.securitySegmentedControl}>
        {sectionOptions.map(({ Icon, id, label }) => {
          const isActive = activeSection === id;

          return (
            <Pressable
              accessibilityLabel={`${label}, ${counts[id]}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={id}
              onPress={() => setActiveSection(id)}
              style={[
                styles.securitySegment,
                isActive ? styles.securitySegmentActive : null
              ]}
            >
              <Icon
                color={isActive ? colors.primaryText : colors.muted}
                size={18}
                strokeWidth={2.2}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.securitySegmentLabel,
                  isActive ? styles.securitySegmentLabelActive : null
                ]}
              >
                {label}
              </Text>
              <Text
                style={[
                  styles.securitySegmentCount,
                  isActive ? styles.securitySegmentCountActive : null
                ]}
              >
                {counts[id]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.securityListSection}>
        <View style={styles.securitySectionHeading}>
          <ShieldCheck color={colors.primaryText} size={20} strokeWidth={2.2} />
          <Text style={styles.securitySectionTitle}>
            {getSectionTitle(activeSection)}
          </Text>
        </View>

        {activeSection === "hidden" ? (
          hiddenPlayers.length > 0 || mutedContentPreferences.length > 0 ? (
            <>
              {hiddenPlayers.map((entry) => (
                <SecurityPlayerRow
                  actionLabel="Voltar a mostrar publicação"
                  entry={entry}
                  key={entry.id}
                  onRestore={() =>
                    entry.selectionIds.forEach(onRestorePlayer)
                  }
                />
              ))}
              {mutedContentPreferences.map((entry) => (
                <SecurityMutedContentRow
                  entry={entry}
                  key={entry.contentKey}
                  onRestore={() => onRestoreMutedContent(entry.contentKey)}
                />
              ))}
            </>
          ) : (
            <SecurityEmptyState
              body="Publicações ocultadas e tipos marcados como sem interesse aparecerão aqui."
              title="Nenhum conteúdo ocultado"
            />
          )
        ) : null}

        {activeSection === "reported" ? (
          reportedPlayers.length > 0 ? (
            reportedPlayers.map((entry) => (
              <SecurityPlayerRow
                actionLabel="Retirar denúncia"
                entry={entry}
                key={entry.id}
                onRestore={() =>
                  entry.selectionIds.forEach(onWithdrawReport)
                }
              />
            ))
          ) : (
            <SecurityEmptyState
              body="As publicações denunciadas aparecerão aqui."
              title="Nenhuma denúncia enviada"
            />
          )
        ) : null}

        {activeSection === "blocked" ? (
          blockedProfiles.length > 0 ? (
            blockedProfiles.map((entry) => (
              <SecurityBlockedProfileRow
                entry={entry}
                key={entry.profileId}
                onRestore={() => onUnblockProfile(entry.profileId)}
                profileAvatars={profileAvatars}
              />
            ))
          ) : (
            <SecurityEmptyState
              body="Os perfis bloqueados aparecerão aqui."
              title="Nenhum perfil bloqueado"
            />
          )
        ) : null}
      </View>
    </ScrollView>
  );
}

type PlayerEntry = {
  id: string;
  mediaType: Player["mediaType"];
  meta: string;
  selectionIds: string[];
  title: string;
};

function buildPlayerEntries(playerIds: Set<string>, players: Player[]) {
  const entries = new Map<string, PlayerEntry>();

  playerIds.forEach((selectionId) => {
    const player = players.find(
      (item) =>
        item.id === selectionId || item.id === `approved-${selectionId}`
    );
    const entryId = player?.id ?? selectionId;
    const currentEntry = entries.get(entryId);

    if (currentEntry) {
      currentEntry.selectionIds.push(selectionId);
      return;
    }

    entries.set(entryId, {
      id: entryId,
      mediaType: player?.mediaType,
      meta: player
        ? `@${player.username ?? "perfil"} · ${player.position} | ${player.city}`
        : "Publicação não disponível no feed atual",
      selectionIds: [selectionId],
      title: player?.videoTitle ?? "Publicação indisponível"
    });
  });

  return [...entries.values()];
}

type MutedContentEntry = {
  contentKey: string;
  label: string;
};

function buildMutedContentEntries(
  mutedContentKeys: Set<string>,
  players: Player[]
) {
  return [...mutedContentKeys].map<MutedContentEntry>((contentKey) => {
    const player = players.find(
      (item) => getPlayerContentKey(item) === contentKey
    );

    return {
      contentKey,
      label: player
        ? getPlayerContentLabel(player)
        : getStoredContentLabel(contentKey)
    };
  });
}

function getStoredContentLabel(contentKey: string) {
  if (contentKey === "media:image") return "fotos";
  if (contentKey === "media:video") return "vídeos";
  if (contentKey.startsWith("tag:")) {
    return `#${contentKey.slice(4).replace(/-/g, " ")}`;
  }

  return "publicações semelhantes";
}

type BlockedProfileEntry = {
  avatar?: ProfileAvatar;
  name: string;
  profileId: string;
  username: string;
};

function buildBlockedProfileEntry(
  profileId: string,
  players: Player[],
  users: AppUser[]
): Omit<BlockedProfileEntry, "avatar"> {
  const player = players.find((item) => item.profileId === profileId);
  const account = users.find(
    (item) =>
      item.id === player?.ownerUserId || `profile-${item.id}` === profileId
  );

  return {
    name: account?.name ?? player?.name ?? "Perfil indisponível",
    profileId,
    username: account?.username ?? player?.username ?? "perfil"
  };
}

function SecurityPlayerRow({
  actionLabel,
  entry,
  onRestore
}: {
  actionLabel: string;
  entry: PlayerEntry;
  onRestore: () => void;
}) {
  const MediaIcon = entry.mediaType === "image" ? ImageIcon : Video;

  return (
    <View style={styles.securityListRow}>
      <View style={styles.securityMediaIcon}>
        <MediaIcon color={colors.primaryText} size={20} strokeWidth={2.1} />
      </View>
      <View style={styles.securityRowBody}>
        <Text numberOfLines={1} style={styles.securityRowTitle}>
          {entry.title}
        </Text>
        <Text numberOfLines={2} style={styles.securityRowMeta}>
          {entry.meta}
        </Text>
      </View>
      <RestoreButton accessibilityLabel={actionLabel} onPress={onRestore} />
    </View>
  );
}

function SecurityMutedContentRow({
  entry,
  onRestore
}: {
  entry: MutedContentEntry;
  onRestore: () => void;
}) {
  return (
    <View style={styles.securityListRow}>
      <View style={styles.securityMediaIcon}>
        <EyeOff color={colors.primaryText} size={20} strokeWidth={2.1} />
      </View>
      <View style={styles.securityRowBody}>
        <Text numberOfLines={1} style={styles.securityRowTitle}>
          Conteúdo {entry.label}
        </Text>
        <Text numberOfLines={2} style={styles.securityRowMeta}>
          Você marcou este tipo de publicação como sem interesse.
        </Text>
      </View>
      <RestoreButton
        accessibilityLabel={`Voltar a mostrar ${entry.label}`}
        onPress={onRestore}
      />
    </View>
  );
}

function SecurityBlockedProfileRow({
  entry,
  onRestore,
  profileAvatars
}: {
  entry: Omit<BlockedProfileEntry, "avatar">;
  onRestore: () => void;
  profileAvatars: ProfileAvatarsByProfile;
}) {
  const avatar = profileAvatars[entry.profileId];
  const initials = entry.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View style={styles.securityListRow}>
      <View style={styles.securityAvatar}>
        {avatar ? (
          <ProfileAvatarImage avatar={avatar} />
        ) : (
          <Text style={styles.securityAvatarText}>{initials}</Text>
        )}
      </View>
      <View style={styles.securityRowBody}>
        <Text numberOfLines={1} style={styles.securityRowTitle}>
          @{entry.username}
        </Text>
        <Text numberOfLines={1} style={styles.securityRowMeta}>
          {entry.name}
        </Text>
      </View>
      <RestoreButton accessibilityLabel="Desbloquear perfil" onPress={onRestore} />
    </View>
  );
}

function RestoreButton({
  accessibilityLabel,
  onPress
}: {
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.securityRestoreButton,
        pressed ? styles.securityRestoreButtonPressed : null
      ]}
    >
      <RotateCcw color={colors.primaryText} size={19} strokeWidth={2.3} />
    </Pressable>
  );
}

function SecurityEmptyState({ body, title }: { body: string; title: string }) {
  return (
    <View style={styles.securityEmptyState}>
      <ShieldCheck color={colors.muted} size={30} strokeWidth={1.8} />
      <Text style={styles.securityEmptyTitle}>{title}</Text>
      <Text style={styles.securityEmptyBody}>{body}</Text>
    </View>
  );
}

function getSectionTitle(section: SecuritySection) {
  if (section === "reported") return "Publicações denunciadas";
  if (section === "blocked") return "Perfis bloqueados";
  return "Publicações ocultadas";
}
