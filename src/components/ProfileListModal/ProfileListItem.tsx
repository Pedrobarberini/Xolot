import React from "react";
import { Text, View } from "react-native";
import { ProfileAvatarImage } from "../ProfileAvatarImage";
import { styles } from "./ProfileListModal.styles";
import type { ProfileListItemData } from "./ProfileListModal.types";

export function ProfileListItem({
  isLast,
  profile
}: {
  isLast: boolean;
  profile: ProfileListItemData;
}) {
  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.item, isLast ? styles.itemLast : null]}>
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
    </View>
  );
}
