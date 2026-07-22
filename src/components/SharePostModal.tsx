import React, { useEffect, useState } from "react";
import { Check, Send, Share2, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  MessageContact,
  ProfileAvatarsByProfile
} from "../types";
import { ProfileAvatarImage } from "./ProfileAvatarImage";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function SharePostModal({
  contacts,
  onClose,
  onShare,
  profileAvatars,
  videoId,
  videoTitle,
  visible
}: {
  contacts: MessageContact[];
  onClose: () => void;
  onShare: (contact: MessageContact) => void;
  profileAvatars: ProfileAvatarsByProfile;
  videoId: string;
  videoTitle: string;
  visible: boolean;
}) {
  const [sentContactIds, setSentContactIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSentContactIds([]);
    }
  }, [videoId, visible]);

  function shareWithContact(contact: MessageContact) {
    if (sentContactIds.includes(contact.id)) {
      return;
    }

    onShare(contact);
    setSentContactIds((current) => [...current, contact.id]);
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.videoActionsRoot}>
        <Pressable
          accessibilityLabel="Fechar compartilhamento"
          onPress={onClose}
          style={styles.videoActionsBackdrop}
        />
        <View accessibilityViewIsModal style={styles.sharePostSheet}>
          <View style={styles.videoActionsHeader}>
            <View style={styles.videoActionsHeaderIcon}>
              <Share2 color={colors.primary} size={19} />
            </View>
            <View style={styles.videoActionsTitleBlock}>
              <Text style={styles.videoActionsTitle}>Compartilhar</Text>
              <Text numberOfLines={1} style={styles.videoActionsSubtitle}>
                {videoTitle}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              hitSlop={8}
              onPress={onClose}
              style={styles.videoActionsClose}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          {contacts.length > 0 ? (
            <ScrollView
              contentContainerStyle={styles.sharePostContactList}
              keyboardShouldPersistTaps="handled"
              style={styles.sharePostContactScroll}
            >
              {contacts.map((contact) => {
                const wasSent = sentContactIds.includes(contact.id);

                return (
                  <Pressable
                    accessibilityLabel={
                      wasSent
                        ? `Enviado para ${contact.name}`
                        : `Enviar para ${contact.name}`
                    }
                    accessibilityRole="button"
                    disabled={wasSent}
                    key={contact.id}
                    onPress={() => shareWithContact(contact)}
                    style={styles.sharePostContactRow}
                  >
                    <View style={styles.sharePostAvatar}>
                      {profileAvatars[contact.profileId] ? (
                        <ProfileAvatarImage
                          avatar={profileAvatars[contact.profileId]}
                        />
                      ) : (
                        <Text style={styles.sharePostAvatarText}>
                          {getInitials(contact.name)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.sharePostContactIdentity}>
                      <Text numberOfLines={1} style={styles.sharePostContactName}>
                        {contact.username ? `@${contact.username}` : contact.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.sharePostContactMeta}>
                        {contact.username ? contact.name : contact.subtitle}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.sharePostSendButton,
                        wasSent ? styles.sharePostSendButtonDone : null
                      ]}
                    >
                      {wasSent ? (
                        <Check color={colors.primary} size={17} strokeWidth={2.6} />
                      ) : (
                        <Send color={colors.onPrimary} size={16} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.sharePostEmpty}>
              <Share2 color={colors.muted} size={26} />
              <Text style={styles.sharePostEmptyTitle}>
                Nenhum perfil disponível
              </Text>
              <Text style={styles.sharePostEmptyBody}>
                Siga um perfil ou inicie uma conversa para compartilhar.
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.sharePostDoneButton}
          >
            <Text style={styles.sharePostDoneButtonText}>
              {sentContactIds.length > 0 ? "Concluir" : "Fechar"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
