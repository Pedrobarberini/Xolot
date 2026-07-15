import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Search,
  Send
} from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { DirectMessage, MessageContact } from "../types";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function MessagesScreen({
  activeContactId,
  contacts,
  currentUserId,
  messages,
  onFindProfiles,
  onSelectContact,
  onSendMessage
}: {
  activeContactId: string | null;
  contacts: MessageContact[];
  currentUserId: string;
  messages: DirectMessage[];
  onFindProfiles: () => void;
  onSelectContact: (contactId: string | null) => void;
  onSendMessage: (contactId: string, body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const activeContact = contacts.find(
    (contact) => contact.id === activeContactId
  );
  const activeMessages = useMemo(
    () =>
      activeContact
        ? messages.filter((message) => message.contactId === activeContact.id)
        : [],
    [activeContact, messages]
  );

  useEffect(() => {
    setDraft("");
  }, [activeContactId]);

  if (activeContact) {
    const sendDraft = () => {
      const body = draft.trim();

      if (!body) {
        return;
      }

      onSendMessage(activeContact.id, body);
      setDraft("");
    };

    return (
      <View style={styles.messagesScreen}>
        <View style={styles.messagesConversationHeader}>
          <Pressable
            accessibilityLabel="Voltar para conversas"
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => onSelectContact(null)}
            style={styles.messagesBackButton}
          >
            <ArrowLeft color={colors.text} size={21} />
          </Pressable>
          <View style={styles.messagesContactAvatar}>
            <Text style={styles.messagesContactAvatarText}>
              {getInitials(activeContact.name)}
            </Text>
          </View>
          <View style={styles.messagesContactIdentity}>
            <Text numberOfLines={1} style={styles.messagesContactName}>
              {activeContact.name}
            </Text>
            <Text numberOfLines={1} style={styles.messagesContactSubtitle}>
              {activeContact.subtitle}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesThreadContent}
          keyboardShouldPersistTaps="handled"
        >
          {activeMessages.length === 0 ? (
            <View style={styles.messagesThreadEmpty}>
              <MessageCircle color={colors.primary} size={28} />
              <Text style={styles.messagesThreadEmptyTitle}>
                Envie a primeira mensagem
              </Text>
              <Text style={styles.messagesThreadEmptyBody}>
                Inicie uma conversa diretamente com este perfil.
              </Text>
            </View>
          ) : (
            activeMessages.map((message) => {
              const isMine = message.senderUserId === currentUserId;

              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubbleRow,
                    isMine ? styles.messageBubbleRowMine : null
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMine ? styles.messageBubbleMine : null
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageBubbleText,
                        isMine ? styles.messageBubbleTextMine : null
                      ]}
                    >
                      {message.body}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.messageComposer}>
          <TextInput
            accessibilityLabel={`Mensagem para ${activeContact.name}`}
            multiline
            onChangeText={setDraft}
            placeholder="Escreva uma mensagem"
            placeholderTextColor={colors.muted}
            style={styles.messageComposerInput}
            value={draft}
          />
          <Pressable
            accessibilityLabel="Enviar mensagem"
            accessibilityRole="button"
            disabled={!draft.trim()}
            onPress={sendDraft}
            style={[
              styles.messageSendButton,
              !draft.trim() ? styles.messageSendButtonDisabled : null
            ]}
          >
            <Send color={colors.onPrimary} size={19} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.messagesContent}>
      <View style={styles.discoveryHeader}>
        <Text style={styles.discoveryTitle}>Mensagens</Text>
        <Text style={styles.discoverySubtitle}>
          Converse diretamente com os perfis que voce encontrou.
        </Text>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.messagesEmptyState}>
          <View style={styles.messagesIcon}>
            <MessageCircle color={colors.primary} size={30} />
          </View>
          <Text style={styles.discoveryEmptyTitle}>Nenhuma conversa ainda</Text>
          <Text style={styles.discoveryEmptyBody}>
            Encontre um perfil e use o botao de mensagem para iniciar uma
            conversa.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onFindProfiles}
            style={({ pressed }) => [
              styles.messagesSearchButton,
              pressed ? styles.buttonPressed : null
            ]}
          >
            <Search color={colors.onPrimary} size={18} />
            <Text style={styles.messagesSearchButtonText}>Pesquisar perfis</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.messagesContactList}>
          {contacts.map((contact) => {
            const lastMessage = [...messages]
              .reverse()
              .find((message) => message.contactId === contact.id);

            return (
              <Pressable
                accessibilityLabel={`Abrir conversa com ${contact.name}`}
                accessibilityRole="button"
                key={contact.id}
                onPress={() => onSelectContact(contact.id)}
                style={({ pressed }) => [
                  styles.messagesContactCard,
                  pressed ? styles.buttonPressed : null
                ]}
              >
                <View style={styles.messagesContactAvatar}>
                  <Text style={styles.messagesContactAvatarText}>
                    {getInitials(contact.name)}
                  </Text>
                </View>
                <View style={styles.messagesContactIdentity}>
                  <Text numberOfLines={1} style={styles.messagesContactName}>
                    {contact.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.messagesContactPreview}>
                    {lastMessage?.body ?? contact.subtitle}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
