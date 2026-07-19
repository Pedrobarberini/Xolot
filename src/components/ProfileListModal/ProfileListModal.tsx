import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "../../theme";
import { ProfileListItem } from "./ProfileListItem";
import { styles } from "./ProfileListModal.styles";
import type { ProfileListItemData } from "./ProfileListModal.types";

const DEFAULT_PAGE_SIZE = 8;
const LOADING_FALLBACK_DURATION = 180;

export function ProfileListModal({
  emptyBody,
  emptyTitle,
  items,
  onClose,
  pageSize = DEFAULT_PAGE_SIZE,
  title,
  visible
}: {
  emptyBody: string;
  emptyTitle: string;
  items: ProfileListItemData[];
  onClose: () => void;
  pageSize?: number;
  title: string;
  visible: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(pageSize);

  useEffect(() => {
    if (!visible) {
      setVisibleItemsCount(pageSize);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), LOADING_FALLBACK_DURATION);

    return () => clearTimeout(timer);
  }, [pageSize, visible]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleItemsCount),
    [items, visibleItemsCount]
  );
  const hasMoreItems = visibleItems.length < items.length;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityLabel={`Fechar ${title.toLowerCase()}`}
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View accessibilityViewIsModal style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.heading}>{title}</Text>
              <Text style={styles.count}>
                {items.length} {items.length === 1 ? "perfil" : "perfis"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={`Fechar ${title.toLowerCase()}`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}
            >
              <X color={colors.text} size={22} />
            </Pressable>
          </View>
          <View style={styles.content}>
            {isLoading ? (
              <ProfileListLoadingFallback />
            ) : items.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                <Text style={styles.emptyBody}>{emptyBody}</Text>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.list}>
                {visibleItems.map((profile, index) => (
                  <ProfileListItem
                    isLast={index === visibleItems.length - 1}
                    key={profile.id}
                    profile={profile}
                  />
                ))}
              </ScrollView>
            )}
          </View>
          {hasMoreItems && !isLoading ? (
            <View style={styles.footer}>
              <Pressable
                accessibilityLabel="Carregar mais perfis"
                accessibilityRole="button"
                onPress={() => setVisibleItemsCount((current) => current + pageSize)}
                style={styles.loadMoreButton}
              >
                <Text style={styles.loadMoreText}>Carregar mais</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function ProfileListLoadingFallback() {
  return (
    <View accessibilityLabel="Carregando perfis" style={styles.loadingList}>
      {Array.from({ length: 4 }, (_, index) => (
        <View key={index} style={styles.loadingRow}>
          <View style={styles.loadingAvatar} />
          <View style={styles.itemText}>
            <View style={styles.loadingText} />
            <View style={styles.loadingTextSmall} />
          </View>
        </View>
      ))}
    </View>
  );
}
