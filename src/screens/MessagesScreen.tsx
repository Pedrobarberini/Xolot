import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BellOff,
  Check,
  CheckCheck,
  LockKeyhole,
  MessageCircle,
  Pin,
  Search,
  Send,
  UserCheck,
  UserPlus,
  X
} from "lucide-react-native";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { ConversationActionsModal } from "../components/ConversationActionsModal";
import { BackButton } from "../components/Navigation";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { SharedPostThumbnail } from "../components/SharedPostThumbnail";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import {
  DirectMessage,
  MessageContact,
  Player,
  ProfileAvatarsByProfile
} from "../types";
import { canExchangeDirectMessages } from "../utils/socialAccess";
import { MAX_PINNED_CONVERSATIONS } from "../utils/conversations";
import { getSharedPostCaption } from "../utils/socialSharing";
import { useFocusedScroll } from "../shared/ui/useFocusedScroll";
import {
  formatDirectMessageTime,
  getDirectMessageReceiptState
} from "../utils/directMessages";
import {
  matchesProfileSearch,
  normalizeProfileSearchValue
} from "../utils/profileSearch";

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
  focusMessageId,
  focusRequestId,
  messages,
  mutedContactIds,
  onDeleteConversation,
  onFindProfiles,
  onOpenProfile,
  onOpenSharedPost,
  onMarkMessagesRead,
  onSelectContact,
  onSendMessage,
  onToggleFollow,
  onToggleMute,
  onTogglePin,
  pinnedContactIds,
  players,
  profileAvatars
}: {
  activeContactId: string | null;
  contacts: MessageContact[];
  currentUserId: string;
  followingProfileIds: string[];
  focusMessageId?: string;
  focusRequestId?: number;
  messages: DirectMessage[];
  mutedContactIds: string[];
  onDeleteConversation: (contactId: string) => void;
  onFindProfiles: () => void;
  onOpenProfile: (contactId: string) => void;
  onOpenSharedPost: (playerId: string) => void;
  onMarkMessagesRead: (messageIds: string[]) => void;
  onSelectContact: (contactId: string | null) => void;
  onSendMessage: (contactId: string, body: string) => void;
  onToggleFollow: (profileId: string) => void;
  onToggleMute: (contactId: string) => void;
  onTogglePin: (contactId: string) => void;
  pinnedContactIds: string[];
  players: Player[];
  profileAvatars: ProfileAvatarsByProfile;
}) {
  const { onItemLayout, scrollRef, scrollToTarget } = useFocusedScroll(focusMessageId, focusRequestId);
  const [draft, setDraft] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [actionContact, setActionContact] = useState<MessageContact | null>(
    null
  );
  const longPressedContactId = useRef<string | null>(null);
  const followingSet = useMemo(
    () => new Set(followingProfileIds),
    [followingProfileIds]
  );
  const mutedContactSet = useMemo(
    () => new Set(mutedContactIds),
    [mutedContactIds]
  );
  const pinnedContactSet = useMemo(
    () => new Set(pinnedContactIds),
    [pinnedContactIds]
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
  const canReadActiveConversation = Boolean(
    activeContact &&
      canExchangeDirectMessages(
        currentUserId,
        activeContact.id,
        followingSet.has(activeContact.profileId)
      )
  );
  const unreadIncomingMessageIds = useMemo(
    () =>
      canReadActiveConversation
        ? activeMessages
            .filter(
              (message) =>
                message.recipientUserId === currentUserId && !message.readAt
            )
            .map((message) => message.id)
        : [],
    [activeMessages, canReadActiveConversation, currentUserId]
  );
  const unreadIncomingMessageKey = unreadIncomingMessageIds.join("|");
  const markMessagesReadRef = useRef(onMarkMessagesRead);
  markMessagesReadRef.current = onMarkMessagesRead;
  const normalizedContactQuery = normalizeProfileSearchValue(contactQuery);
  const visibleContacts = contacts.filter((contact) =>
    matchesProfileSearch(normalizedContactQuery, [
      contact.name,
      contact.username,
      contact.subtitle
    ])
  );
  const followedContacts = visibleContacts.filter(
    (contact) =>
      contact.id === currentUserId || followingSet.has(contact.profileId)
  );
  const requestContacts = visibleContacts.filter(
    (contact) =>
      contact.id !== currentUserId && !followingSet.has(contact.profileId)
  );

  useEffect(() => {
    setDraft("");
  }, [activeContactId]);

  useEffect(() => {
    if (!activeContactId || !unreadIncomingMessageKey) {
      return;
    }
    markMessagesReadRef.current(unreadIncomingMessageIds);
  }, [activeContactId, unreadIncomingMessageKey]);

  if (activeContact) {
    const isFollowing = followingSet.has(activeContact.profileId);
    const isSelf = activeContact.id === currentUserId;
    const hasConversationAccess = canReadActiveConversation;
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
          <BackButton
            accessibilityLabel="Voltar para conversas"
            onPress={() => onSelectContact(null)}
          />
          <Pressable
            accessibilityLabel={`Abrir perfil de ${activeContact.name}`}
            accessibilityRole="button"
            onPress={() => onOpenProfile(activeContact.id)}
            style={({ pressed }) => [
              styles.messagesContactProfileButton,
              pressed ? styles.buttonPressed : null,
            ]}
          >
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
          </Pressable>
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
                <UserCheck color={colors.primaryText} size={17} strokeWidth={2.3} />
              ) : (
                <UserPlus color={colors.onPrimary} size={17} strokeWidth={2.3} />
              )}
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesThreadContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToTarget}
          ref={scrollRef}
        >
          {!hasConversationAccess && incomingRequestMessages.length > 0 ? (
            <View style={styles.messagesRequestGate}>
              <View style={styles.messagesRequestGateIcon}>
                <LockKeyhole color={colors.primaryText} size={24} />
              </View>
              <Text style={styles.messagesThreadEmptyTitle}>
                Solicitação de mensagem
              </Text>
              <Text style={styles.messagesThreadEmptyBody}>
                Siga {activeContact.name} para ver as mensagens recebidas e
                responder com segurança.
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
              <MessageCircle color={colors.primaryText} size={28} />
              <Text style={styles.messagesThreadEmptyTitle}>
                {hasConversationAccess
                  ? "Envie a primeira mensagem"
                  : "Envie uma solicitação"}
              </Text>
              <Text style={styles.messagesThreadEmptyBody}>
                {hasConversationAccess
                  ? isSelf
                    ? "Use esta conversa como seu espaço privado."
                    : "Inicie uma conversa diretamente com este perfil."
                  : "Você pode enviar uma mensagem inicial. Para continuar a conversa, siga este perfil."}
              </Text>
            </View>
          ) : (
            visibleMessages.map((message) => {
              const isMine = message.senderUserId === currentUserId;
              const sharedPlayer = message.sharedPost
                ? players.find(
                    (player) => player.id === message.sharedPost?.playerId
                  )
                : undefined;
              const sharedCaption = getSharedPostCaption(message);
              const receiptState = getDirectMessageReceiptState(message);
              const receiptLabel =
                receiptState === "read"
                  ? "Vista"
                  : receiptState === "delivered"
                    ? "Entregue"
                    : "Enviada";

              return (
                <View
                  key={message.id}
                  onLayout={(event) => onItemLayout(message.id, event.nativeEvent.layout.y)}
                  testID={`message-${message.id}`}
                  style={[
                    styles.messageBubbleRow,
                    isMine ? styles.messageBubbleRowMine : null,
                    message.id === focusMessageId ? { backgroundColor: colors.primarySoft, borderRadius: 12 } : null
                  ]}
                >
                  {message.sharedPost ? (
                    <>
                      <Pressable
                        accessibilityLabel={
                          sharedPlayer
                            ? `Abrir publicação ${message.sharedPost.title}`
                            : "Publicação indisponível"
                        }
                        accessibilityRole="button"
                        disabled={!sharedPlayer}
                        onPress={() =>
                          sharedPlayer && onOpenSharedPost(sharedPlayer.id)
                        }
                        style={[
                          styles.sharedPostMessage,
                          !sharedPlayer
                            ? styles.sharedPostMessageUnavailable
                            : null
                        ]}
                      >
                        <SharedPostThumbnail
                          authorName={
                            sharedPlayer
                              ? message.sharedPost.authorName
                              : "Publicação indisponível"
                          }
                          mediaType={message.sharedPost.mediaType}
                          player={sharedPlayer}
                          title={message.sharedPost.title}
                        />
                      </Pressable>
                      {sharedCaption ? (
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
                            {sharedCaption}
                          </Text>
                        </View>
                      ) : null}
                    </>
                  ) : (
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
                  )}
                  <View
                    style={[
                      styles.messageMetadata,
                      isMine ? styles.messageMetadataMine : null
                    ]}
                  >
                    <Text style={styles.messageTimeText}>
                      {formatDirectMessageTime(message.createdAt)}
                    </Text>
                    {isMine ? (
                      <View
                        accessibilityLabel={receiptLabel}
                        accessibilityRole="text"
                        style={styles.messageReceipt}
                      >
                        {receiptState === "sent" ? (
                          <Check color={colors.muted} size={15} strokeWidth={2.2} />
                        ) : (
                          <CheckCheck
                            color={
                              receiptState === "read"
                                ? colors.primary
                                : colors.muted
                            }
                            size={16}
                            strokeWidth={2.2}
                          />
                        )}
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}

          {!hasConversationAccess && outgoingRequestMessages.length > 0 ? (
            <View style={styles.messagesRequestSentNotice}>
              <Text style={styles.messagesRequestSentTitle}>
                Solicitação enviada
              </Text>
              <Text style={styles.messagesRequestSentBody}>
                A conversa completa será liberada quando você
                seguir este perfil.
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
            onKeyPress={(event) => {
              const isShiftPressed =
                "shiftKey" in event.nativeEvent &&
                Boolean(event.nativeEvent.shiftKey);

              if (
                Platform.OS === "web" &&
                event.nativeEvent.key === "Enter" &&
                !isShiftPressed
              ) {
                event.preventDefault();
                sendDraft();
              }
            }}
            onSubmitEditing={sendDraft}
            placeholder={
              canCompose
                ? hasConversationAccess
                  ? "Escreva uma mensagem"
                  : "Enviar uma solicitação"
                : "Siga o perfil para conversar"
            }
            placeholderTextColor={colors.muted}
            style={[
              styles.messageComposerInput,
              !canCompose ? styles.messageComposerInputDisabled : null
            ]}
            returnKeyType="send"
            submitBehavior="submit"
            value={draft}
          />
          <Pressable
            accessibilityLabel={
              hasConversationAccess ? "Enviar mensagem" : "Enviar solicitação"
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
    const isMuted = mutedContactSet.has(contact.id);
    const isPinned = pinnedContactSet.has(contact.id);

    return (
      <Pressable
        accessibilityLabel={`Abrir conversa com ${contact.name}`}
        accessibilityHint="Toque e segure para abrir as opções da conversa"
        accessibilityRole="button"
        delayLongPress={450}
        key={contact.id}
        onLongPress={() => {
          longPressedContactId.current = contact.id;
          setActionContact(contact);
        }}
        onPress={() => {
          if (longPressedContactId.current === contact.id) {
            longPressedContactId.current = null;
            return;
          }

          onSelectContact(contact.id);
        }}
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
              ? "Nova solicitação de mensagem"
              : lastMessage?.body ?? contact.subtitle}
          </Text>
        </View>
        <View style={styles.messagesContactIndicators}>
          {isPinned ? <Pin color={colors.primaryText} size={15} /> : null}
          {isMuted ? <BellOff color={colors.muted} size={15} /> : null}
          {isRequest ? (
            <View style={styles.messagesRequestPill}>
              <Text style={styles.messagesRequestPillText}>Solicitação</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.messagesContent}>
      <View style={styles.discoveryHeader}>
        <Text style={styles.discoveryTitle}>Mensagens</Text>
        <Text style={styles.discoverySubtitle}>
          Conversas organizadas conforme os perfis que você segue.
        </Text>
      </View>

      <View style={styles.searchField}>
        <Search color={colors.muted} size={19} />
        <TextInput
          accessibilityLabel="Pesquisar conversas"
          autoCapitalize="none"
          onChangeText={setContactQuery}
          placeholder="Nome ou @username"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.searchInput}
          value={contactQuery}
        />
        {contactQuery ? (
          <Pressable
            accessibilityLabel="Limpar pesquisa de conversas"
            hitSlop={8}
            onPress={() => setContactQuery("")}
            style={styles.searchClearButton}
          >
            <X color={colors.text} size={17} />
          </Pressable>
        ) : null}
      </View>

      {contacts.length === 0 ? (
        <View style={styles.messagesEmptyState}>
          <View style={styles.messagesIcon}>
            <MessageCircle color={colors.primaryText} size={30} />
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
      ) : normalizedContactQuery && visibleContacts.length === 0 ? (
        <View style={styles.discoveryEmptyState}>
          <Search color={colors.muted} size={28} />
          <Text style={styles.discoveryEmptyTitle}>
            Nenhuma conversa encontrada
          </Text>
          <Text style={styles.discoveryEmptyBody}>
            Tente pesquisar por outro nome ou @username.
          </Text>
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
              <Text style={styles.messagesSectionTitle}>Solicitações</Text>
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
              Nenhuma solicitação pendente.
            </Text>
          )}
        </>
      )}
      </ScrollView>
      <ConversationActionsModal
        contact={actionContact}
        isMuted={Boolean(
          actionContact && mutedContactSet.has(actionContact.id)
        )}
        isPinned={Boolean(
          actionContact && pinnedContactSet.has(actionContact.id)
        )}
        onClose={() => {
          longPressedContactId.current = null;
          setActionContact(null);
        }}
        onDelete={() => {
          if (!actionContact) {
            return;
          }

          const contact = actionContact;
          onDeleteConversation(contact.id);

          if (activeContactId === contact.id) {
            onSelectContact(null);
          }
        }}
        onToggleMute={() => {
          if (actionContact) {
            onToggleMute(actionContact.id);
          }
        }}
        onTogglePin={() => {
          if (!actionContact) {
            return false;
          }

          const isPinned = pinnedContactSet.has(actionContact.id);

          if (!isPinned && pinnedContactIds.length >= MAX_PINNED_CONVERSATIONS) {
            Alert.alert(
              "Limite de conversas fixadas",
              "Desafixe uma conversa antes de fixar outra. O limite é de 3 conversas."
            );
            return false;
          }

          onTogglePin(actionContact.id);
          return true;
        }}
      />
    </>
  );
}
