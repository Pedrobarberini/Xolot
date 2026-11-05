import React, { useEffect, useState } from "react";
import { Check, Share2, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  MessageContact,
  ProfileAvatarsByProfile
} from "../types";
import { selectShareRecipients } from "../utils/socialSharing";
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
  onShare: (contact: MessageContact, message: string) => void;
  profileAvatars: ProfileAvatarsByProfile;
  videoId: string;
  videoTitle: string;
  visible: boolean;
}) {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (visible) {
      setSelectedContactIds([]);
      setShareMessage("");
    }
  }, [videoId, visible]);

  function toggleContact(contactId: string) {
    setSelectedContactIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId]
    );
  }

  function sendToSelectedContacts() {
    const recipients = selectShareRecipients(contacts, selectedContactIds);
    if (recipients.length === 0) {
      return;
    }

    recipients.forEach((contact) => onShare(contact, shareMessage));
    onClose();
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
              <Share2 color={colors.primaryText} size={19} />
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
          <View style={styles.sharePostMessageField}>
            <Text style={styles.sharePostMessageLabel}>Mensagem opcional</Text>
            <TextInput
              accessibilityLabel="Mensagem para acompanhar a publicação"
              maxLength={280}
              multiline
              onChangeText={setShareMessage}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor={colors.muted}
              style={styles.sharePostMessageInput}
              value={shareMessage}
            />
          </View>


          {contacts.length > 0 ? (
            <ScrollView
              contentContainerStyle={styles.sharePostContactList}
              keyboardShouldPersistTaps="handled"
              style={styles.sharePostContactScroll}
            >
              {contacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);

                return (
                  <Pressable
                    accessibilityLabel={
                      `${isSelected ? "Remover" : "Selecionar"} ${contact.name}`
                    }
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={contact.id}
                    onPress={() => toggleContact(contact.id)}
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
                        isSelected ? styles.sharePostSendButtonDone : null
                      ]}
                    >
                      {isSelected ? (
                        <Check color={colors.onPrimary} size={17} strokeWidth={2.8} />
                      ) : null}
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
            accessibilityState={{
              disabled: contacts.length > 0 && selectedContactIds.length === 0
            }}
            disabled={contacts.length > 0 && selectedContactIds.length === 0}
            onPress={contacts.length === 0 ? onClose : sendToSelectedContacts}
            style={[
              styles.sharePostDoneButton,
              contacts.length > 0 && selectedContactIds.length === 0
                ? styles.sharePostDoneButtonDisabled
                : null,
            ]}
          >
            <Text style={styles.sharePostDoneButtonText}>
              {contacts.length === 0
                ? "Fechar"
                : selectedContactIds.length > 0
                  ? `Enviar para ${selectedContactIds.length}`
                  : "Selecione um perfil"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
