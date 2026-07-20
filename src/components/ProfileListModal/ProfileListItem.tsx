import React from "react";
import { Pressable, Text, View } from "react-native";
import { ProfileAvatarImage } from "../ProfileAvatarImage";
import { styles } from "./ProfileListModal.styles";
import type { ProfileListItemData } from "./ProfileListModal.types";

export function ProfileListItem({
  isLast,
  onPress,
  profile
}: {
  isLast: boolean;
  onPress: () => void;
  profile: ProfileListItemData;
}) {
  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Pressable
      accessibilityLabel={`Abrir perfil de ${profile.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        isLast ? styles.itemLast : null,
        pressed ? styles.itemPressed : null
      ]}
    >
      <View style={styles.avatar}>
        {profile.avatar ? (
          <ProfileAvatarImage avatar={profile.avatar} />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
      </View>
      <View style={styles.itemText}>
        <Text numberOfLines={1} style={styles.username}>
          {profile.username ? `@${profile.username}` : profile.name}
        </Text>
        {profile.username ? (
          <Text numberOfLines={1} style={styles.name}>
            {profile.name}
          </Text>
        ) : null}
        <Text numberOfLines={1} style={styles.subtitle}>
          {profile.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
