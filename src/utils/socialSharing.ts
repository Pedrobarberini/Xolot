import { BRAND } from "../config/brand.ts";
import type {
  AppUser,
  DirectMessage,
  MessageContact,
  Player,
  SharedPostReference
} from "../types";
import { formatProfileActivity } from "./profileActivity.ts";

export function createSharedPostReference(
  player: Player,
  caption?: string
): SharedPostReference {
  const trimmedCaption = caption?.trim();

  return {
    authorName: player.name,
    ...(trimmedCaption ? { caption: trimmedCaption } : {}),
    mediaType: player.mediaType ?? "video",
    playerId: player.id,
    profileId: player.profileId,
    title: player.videoTitle
  };
}

export function createSharedPostDelivery(
  player: Player,
  message = ""
): Array<Pick<DirectMessage, "body" | "sharedPost">> {
  const trimmedMessage = message.trim();

  return [
    {
      body: "Compartilhou uma publicação",
      sharedPost: createSharedPostReference(player)
    },
    ...(trimmedMessage
      ? [{ body: trimmedMessage }]
      : [])
  ];
}

export function selectShareRecipients(
  contacts: MessageContact[],
  selectedContactIds: string[]
) {
  const selectedIds = new Set(selectedContactIds);
  return contacts.filter((contact) => selectedIds.has(contact.id));
}

export function getSharedPostCaption(message: DirectMessage) {
  const caption = message.sharedPost?.caption?.trim();

  const isSystemShareText = (value: string) =>
    value.toLocaleLowerCase().startsWith("compartilhou uma publica");

  if (caption && !isSystemShareText(caption)) {
    return caption;
  }

  if (!message.sharedPost) {
    return "";
  }

  const body = message.body.trim();

  return isSystemShareText(body) ? "" : body;
}

export function countSharedPostsByPlayer(messages: DirectMessage[]) {
  return messages.reduce<Record<string, number>>((counts, message) => {
    const playerId = message.sharedPost?.playerId;

    if (playerId) {
      counts[playerId] = (counts[playerId] ?? 0) + 1;
    }

    return counts;
  }, {});
}

export function selectShareContacts({
  contacts,
  currentUserId,
  followingProfileIds,
  players,
  users
}: {
  contacts: MessageContact[];
  currentUserId: string;
  followingProfileIds: string[];
  players: Player[];
  users: AppUser[];
}) {
  const contactsById = new Map<string, MessageContact>();

  contacts.forEach((contact) => {
    if (contact.id !== currentUserId) {
      contactsById.set(contact.id, contact);
    }
  });

  followingProfileIds.forEach((profileId) => {
    const player = players.find((item) => item.profileId === profileId);
    const account = users.find(
      (item) =>
        item.id === player?.ownerUserId || `profile-${item.id}` === profileId
    );
    const contactId = account?.id ?? player?.ownerUserId;

    if (!contactId || contactId === currentUserId || contactsById.has(contactId)) {
      return;
    }

    contactsById.set(contactId, {
      id: contactId,
      name: account?.name ?? player?.name ?? `Perfil ${BRAND.name}`,
      profileId,
      subtitle: account?.profileCompleted
        ? formatProfileActivity(account.sport, account.position, account.city)
        : player
          ? formatProfileActivity(player.sport, player.position, player.city)
          : `Usuário ${BRAND.name}`,
      username: account?.username ?? player?.username
    });
  });

  return [...contactsById.values()];
}
