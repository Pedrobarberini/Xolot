import type {
  AppUser,
  MessageContact,
  Player,
  SharedPostReference
} from "../types";

export function createSharedPostReference(
  player: Player
): SharedPostReference {
  return {
    authorName: player.name,
    mediaType: player.mediaType ?? "video",
    playerId: player.id,
    profileId: player.profileId,
    title: player.videoTitle
  };
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
      name: account?.name ?? player?.name ?? "Perfil NextStar",
      profileId,
      subtitle: account?.profileCompleted
        ? `${account.position} | ${account.city}`
        : player
          ? `${player.position} | ${player.city}`
          : "Usuário NextStar",
      username: account?.username ?? player?.username
    });
  });

  return [...contactsById.values()];
}
