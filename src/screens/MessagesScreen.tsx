import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  LockKeyhole,
  MessageCircle,
  Search,
  Send,
  UserCheck,
  UserPlus
} from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import {
  DirectMessage,
  MessageContact,
  ProfileAvatarsByProfile
} from "../types";
import { canExchangeDirectMessages } from "../utils/socialAccess";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getConversationMessages(
  messages: DirectMessage[],
  currentUserId: string,
  contactId: string
) {
  return messages.filter(
    (message) =>
      (message.senderUserId === currentUserId &&
        message.recipientUserId === contactId) ||
      (message.senderUserId === contactId &&
        message.recipientUserId === currentUserId)
  );
}

export function MessagesScreen({
  activeContactId,
  contacts,
  currentUserId,
  followingProfileIds,
  messages,
  onFindProfiles,
  onSelectContact,
  onSendMessage,
  onToggleFollow,
  profileAvatars
}: {
  activeContactId: string | null;
  contacts: MessageContact[];
  currentUserId: string;
  followingProfileIds: string[];
  messages: DirectMessage[];
  onFindProfiles: () => void;
  onSelectContact: (contactId: string | null) => void;
  onSendMessage: (contactId: string, body: string) => void;
  onToggleFollow: (profileId: string) => void;
  profileAvatars: ProfileAvatarsByProfile;
}) {
  const [draft, setDraft] = useState("");
  const followingSet = useMemo(
    () => new Set(followingProfileIds),
    [followingProfileIds]
  );
  const activeContact = contacts.find(
    (contact) => contact.id === activeContactId
  );
  const activeMessages = useMemo(
    () =>
      activeContact
        ? getConversationMessages(messages, currentUserId, activeContact.id)
        : [],
    [activeContact, currentUserId, messages]
  );
  const followedContacts = contacts.filter(
    (contact) =>
      contact.id === currentUserId || followingSet.has(contact.profileId)
  );
  const requestContacts = contacts.filter(
    (contact) =>
      contact.id !== currentUserId && !followingSet.has(contact.profileId)
  );

  useEffect(() => {
    setDraft("");
  }, [activeContactId]);

  if (activeContact) {
    const isFollowing = followingSet.has(activeContact.profileId);
    const isSelf = activeContact.id === currentUserId;
    const hasConversationAccess = canExchangeDirectMessages(
      currentUserId,
      activeContact.id,
      isFollowing
    );
    const outgoingRequestMessages = activeMessages.filter(
      (message) => message.senderUserId === currentUserId
    );
    const incomingRequestMessages = activeMessages.filter(
      (message) => message.senderUserId === activeContact.id
    );
    const canSendInitialRequest =
      !hasConversationAccess && outgoingRequestMessages.length === 0;
    const canCompose = hasConversationAccess || canSendInitialRequest;
    const visibleMessages = hasConversationAccess
      ? activeMessages
      : outgoingRequestMessages;

    const sendDraft = () => {
      const body = draft.trim();

      if (!body || !canCompose) {
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
            {profileAvatars[activeContact.profileId] ? (
              <ProfileAvatarImage
                avatar={profileAvatars[activeContact.profileId]}
              />
            ) : (
              <Text style={styles.messagesContactAvatarText}>
                {getInitials(activeContact.name)}
              </Text>
            )}
          </View>
          <View style={styles.messagesContactIdentity}>
            <Text numberOfLines={1} style={styles.messagesContactName}>
              {activeContact.name}
            </Text>
            <Text numberOfLines={1} style={styles.messagesContactSubtitle}>
              {activeContact.username ? `@${activeContact.username} | ` : ""}
              {isSelf
                ? "Sua conta"
                : isFollowing
                  ? "Seguindo"
                  : "Perfil não seguido"}
            </Text>
          </View>
          {!isSelf ? (
            <Pressable
              accessibilityLabel={
                isFollowing
                  ? `Deixar de seguir ${activeContact.name}`
                  : `Seguir ${activeContact.name}`
              }
              accessibilityRole="button"
              onPress={() => onToggleFollow(activeContact.profileId)}
              style={[
                styles.messagesFollowButton,
                isFollowing ? styles.messagesFollowButtonActive : null
              ]}
            >
              {isFollowing ? (
                <UserCheck color={colors.primary} size={17} strokeWidth={2.3} />
              ) : (
                <UserPlus color={colors.onPrimary} size={17} strokeWidth={2.3} />
              )}
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesThreadContent}
          keyboardShouldPersistTaps="handled"
        >
          {!hasConversationAccess && incomingRequestMessages.length > 0 ? (
            <View style={styles.messagesRequestGate}>
              <View style={styles.messagesRequestGateIcon}>
                <LockKeyhole color={colors.primary} size={24} />
              </View>
              <Text style={styles.messagesThreadEmptyTitle}>
                Solicitacao de mensagem
              </Text>
              <Text style={styles.messagesThreadEmptyBody}>
                Siga {activeContact.name} para visualizar as mensagens recebidas
                e responder com segurança.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => onToggleFollow(activeContact.profileId)}
                style={styles.messagesRequestFollowButton}
              >
                <UserPlus color={colors.onPrimary} size={17} />
                <Text style={styles.messagesRequestFollowButtonText}>
                  Seguir e liberar conversa
                </Text>
              </Pressable>
            </View>
          ) : visibleMessages.length === 0 ? (
            <View style={styles.messagesThreadEmpty}>
              <MessageCircle color={colors.primary} size={28} />
              <Text style={styles.messagesThreadEmptyTitle}>
                {hasConversationAccess
                  ? "Envie a primeira mensagem"
                  : "Envie uma solicitacao"}
              </Text>
              <Text style={styles.messagesThreadEmptyBody}>
                {hasConversationAccess
                  ? isSelf
                    ? "Use esta conversa como um espaço privado para você."
                    : "Inicie uma conversa diretamente com este perfil."
                  : "Você pode enviar uma mensagem inicial. Novas mensagens ficam liberadas quando o perfil for seguido."}
              </Text>
            </View>
          ) : (
            visibleMessages.map((message) => {
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

          {!hasConversationAccess && outgoingRequestMessages.length > 0 ? (
            <View style={styles.messagesRequestSentNotice}>
              <Text style={styles.messagesRequestSentTitle}>
                Solicitacao enviada
              </Text>
              <Text style={styles.messagesRequestSentBody}>
                A conversa completa será liberada quando houver uma conexão por
                follow.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.messageComposer}>
          <TextInput
            accessibilityLabel={`Mensagem para ${activeContact.name}`}
            editable={canCompose}
            multiline
            onChangeText={setDraft}
            placeholder={
              canCompose
                ? hasConversationAccess
                  ? "Escreva uma mensagem"
                  : "Enviar uma solicitacao"
                : "Aguardando conexão por follow"
            }
            placeholderTextColor={colors.muted}
            style={[
              styles.messageComposerInput,
              !canCompose ? styles.messageComposerInputDisabled : null
            ]}
            value={draft}
          />
          <Pressable
            accessibilityLabel={
              hasConversationAccess ? "Enviar mensagem" : "Enviar solicitacao"
            }
            accessibilityRole="button"
            disabled={!canCompose || !draft.trim()}
            onPress={sendDraft}
            style={[
              styles.messageSendButton,
              !canCompose || !draft.trim()
                ? styles.messageSendButtonDisabled
                : null
            ]}
          >
            <Send color={colors.onPrimary} size={19} />
          </Pressable>
        </View>
      </View>
    );
  }

  function renderContact(contact: MessageContact, isRequest: boolean) {
    const conversationMessages = getConversationMessages(
      messages,
      currentUserId,
      contact.id
    );
    const lastMessage = conversationMessages.at(-1);
    const hasHiddenIncomingMessage = conversationMessages.some(
      (message) => message.senderUserId === contact.id
    );

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
          {profileAvatars[contact.profileId] ? (
            <ProfileAvatarImage avatar={profileAvatars[contact.profileId]} />
          ) : (
            <Text style={styles.messagesContactAvatarText}>
              {getInitials(contact.name)}
            </Text>
          )}
        </View>
        <View style={styles.messagesContactIdentity}>
          <Text numberOfLines={1} style={styles.messagesContactName}>
            {contact.name}
          </Text>
          <Text numberOfLines={1} style={styles.messagesContactPreview}>
            {isRequest && hasHiddenIncomingMessage
              ? "Nova solicitacao de mensagem"
              : lastMessage?.body ?? contact.subtitle}
          </Text>
        </View>
        {isRequest ? (
          <View style={styles.messagesRequestPill}>
            <Text style={styles.messagesRequestPillText}>Solicitacao</Text>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.messagesContent}>
      <View style={styles.discoveryHeader}>
        <Text style={styles.discoveryTitle}>Mensagens</Text>
        <Text style={styles.discoverySubtitle}>
          Conversas organizadas de acordo com os perfis que você segue.
        </Text>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.messagesEmptyState}>
          <View style={styles.messagesIcon}>
            <MessageCircle color={colors.primary} size={30} />
          </View>
          <Text style={styles.discoveryEmptyTitle}>Nenhuma conversa ainda</Text>
          <Text style={styles.discoveryEmptyBody}>
            Encontre um perfil e use o botão de mensagem para iniciar uma
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
        <>
          <View style={styles.messagesSectionHeader}>
            <Text style={styles.messagesSectionTitle}>Conversas</Text>
            <Text style={styles.messagesSectionCount}>
              {followedContacts.length}
            </Text>
          </View>
          {followedContacts.length > 0 ? (
            <View style={styles.messagesContactList}>
              {followedContacts.map((contact) => renderContact(contact, false))}
            </View>
          ) : (
            <Text style={styles.messagesSectionEmpty}>
              Siga um perfil para liberar conversas diretas.
            </Text>
          )}

          <View style={[styles.messagesSectionHeader, styles.messagesRequestHeader]}>
            <View>
              <Text style={styles.messagesSectionTitle}>Solicitacoes</Text>
              <Text style={styles.messagesSectionSubtitle}>
                Perfis que você não segue
              </Text>
            </View>
            <Text style={styles.messagesSectionCount}>
              {requestContacts.length}
            </Text>
          </View>
          {requestContacts.length > 0 ? (
            <View style={styles.messagesContactList}>
              {requestContacts.map((contact) => renderContact(contact, true))}
            </View>
          ) : (
            <Text style={styles.messagesSectionEmpty}>
              Nenhuma solicitacao pendente.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}
