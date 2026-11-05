import React, { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { ProfileAvatarsByProfile } from "../types";
import type { MentionableUser } from "../utils/submissionMetadata";
import { ProfileAvatarImage } from "./ProfileAvatarImage";

export function MentionSuggestionsPopover({
  candidates,
  emptyLabel = "Nenhum perfil encontrado.",
  onSelect,
  placement = "below",
  profileAvatars,
  selectedUsernames = [],
  visible
}: {
  candidates: MentionableUser[];
  emptyLabel?: string;
  onSelect: (user: MentionableUser) => void;
  placement?: "above" | "below";
  profileAvatars: ProfileAvatarsByProfile;
  selectedUsernames?: string[];
  visible: boolean;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const selected = new Set(
    selectedUsernames.map((username) => username.toLocaleLowerCase("pt-BR"))
  );

  useEffect(() => {
    entrance.stopAnimation();
    if (!visible) {
      entrance.setValue(0);
      return;
    }
    Animated.timing(entrance, {
      duration: 170,
      toValue: 1,
      useNativeDriver: true
    }).start();
  }, [entrance, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.mentionSuggestionsPopover,
        placement === "above"
          ? styles.mentionSuggestionsAbove
          : styles.mentionSuggestionsBelow,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [placement === "above" ? 7 : -7, 0]
              })
            }
          ]
        }
      ]}
    >
      {candidates.length > 0 ? (
        <ScrollView
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          showsVerticalScrollIndicator
          style={styles.mentionSuggestionsScroll}
        >
          {candidates.map((candidate, index) => {
            const isSelected = selected.has(
              candidate.username.toLocaleLowerCase("pt-BR")
            );
            const avatar = profileAvatars[`profile-${candidate.id}`];
            const fallbackInitial = (candidate.name.trim()[0] ?? candidate.username.trim()[0] ?? "?").toUpperCase();
            return (
              <Pressable
                accessibilityLabel={`Selecionar @${candidate.username}`}
                accessibilityRole="button"
                key={candidate.id}
                onPress={() => onSelect(candidate)}
                style={({ pressed }) => [
                  styles.mentionSuggestionRow,
                  index === candidates.length - 1
                    ? styles.mentionSuggestionRowLast
                    : null,
                  pressed ? styles.buttonPressed : null
                ]}
              >
                <View style={styles.mentionSuggestionIcon}>
                  {avatar ? (
                    <ProfileAvatarImage avatar={avatar} />
                  ) : (
                    <Text style={styles.mentionSuggestionInitial}>
                      {fallbackInitial}
                    </Text>
                  )}
                </View>
                <View style={styles.mentionSuggestionIdentity}>
                  <Text numberOfLines={1} style={styles.mentionSuggestionUsername}>
                    @{candidate.username}
                  </Text>
                  <Text numberOfLines={1} style={styles.mentionSuggestionName}>
                    {candidate.name}
                  </Text>
                </View>
                {isSelected ? (
                  <Check color={colors.primaryText} size={18} strokeWidth={2.7} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.mentionSuggestionEmpty}>{emptyLabel}</Text>
      )}
    </Animated.View>
  );
}