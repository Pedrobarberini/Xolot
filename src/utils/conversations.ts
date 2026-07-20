import type {
  ConversationPreferences,
  DirectMessage,
  MessageContact
} from "../types";

export const MAX_PINNED_CONVERSATIONS = 3;

export const EMPTY_CONVERSATION_PREFERENCES: ConversationPreferences = {
  deletedAtByContactId: {},
  mutedContactIds: [],
  pinnedContactIds: []
};

export function toggleConversationId(ids: string[], contactId: string) {
  return ids.includes(contactId)
    ? ids.filter((id) => id !== contactId)
    : [...ids, contactId];
}

export function togglePinnedConversation(ids: string[], contactId: string) {
  if (ids.includes(contactId)) {
    return ids.filter((id) => id !== contactId);
  }

  return ids.length >= MAX_PINNED_CONVERSATIONS
    ? ids
    : [...ids, contactId];
}

export function sortContactsByPinned(
  contacts: MessageContact[],
  pinnedContactIds: string[]
) {
  const pinOrder = new Map(
    pinnedContactIds.map((contactId, index) => [contactId, index])
  );

  return contacts
    .map((contact, index) => ({ contact, index }))
    .sort((left, right) => {
      const leftPin = pinOrder.get(left.contact.id);
      const rightPin = pinOrder.get(right.contact.id);

      if (leftPin !== undefined && rightPin !== undefined) {
        return leftPin - rightPin;
      }

      if (leftPin !== undefined) {
        return -1;
      }

      if (rightPin !== undefined) {
        return 1;
      }

      return left.index - right.index;
    })
    .map(({ contact }) => contact);
}

export function filterMessagesAfterConversationDeletion(
  messages: DirectMessage[],
  currentUserId: string,
  deletedAtByContactId: Record<string, string>
) {
  return messages.filter((message) => {
    const contactId =
      message.senderUserId === currentUserId
        ? message.recipientUserId
        : message.recipientUserId === currentUserId
          ? message.senderUserId
          : null;

    if (!contactId) {
      return true;
    }

    const deletedAt = deletedAtByContactId[contactId];

    return !deletedAt || message.createdAt > deletedAt;
  });
}
