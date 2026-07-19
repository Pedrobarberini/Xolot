import { useEffect, useMemo, useState } from "react";
import {
  loadSocialState,
  saveSocialState
} from "../services/socialStorage";
import {
  AppUser,
  DirectMessage,
  FollowingByUser,
  MessageContact,
  MessageContactsByUser,
  Player
} from "../types";
import { buildFollowerUserIdsByProfile } from "../utils/profileFollowers";

function upsertMessageContact(
  contacts: MessageContact[],
  contact: MessageContact
) {
  const contactExists = contacts.some((item) => item.id === contact.id);

  return contactExists
    ? contacts.map((item) => (item.id === contact.id ? contact : item))
    : [contact, ...contacts];
}

export function useSocialActions({
  players,
  user
}: {
  players: Player[];
  user: AppUser | null;
}) {
  const [followingByUser, setFollowingByUser] = useState<FollowingByUser>({});
  const [messageContactsByUser, setMessageContactsByUser] =
    useState<MessageContactsByUser>({});
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isSocialStateLoaded, setIsSocialStateLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadSocialState().then((socialState) => {
      if (!isMounted) {
        return;
      }

      setDirectMessages(socialState.directMessages);
      setFollowingByUser(socialState.followingByUser);
      setMessageContactsByUser(socialState.messageContactsByUser);
      setIsSocialStateLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSocialStateLoaded) {
      return;
    }

    saveSocialState({
      directMessages,
      followingByUser,
      messageContactsByUser
    }).catch(() => undefined);
  }, [
    directMessages,
    followingByUser,
    isSocialStateLoaded,
    messageContactsByUser
  ]);

  const followingProfileIds = useMemo(
    () => (user ? followingByUser[user.id] ?? [] : []),
    [followingByUser, user]
  );
  const followingProfileSet = useMemo(
    () => new Set(followingProfileIds),
    [followingProfileIds]
  );
  const followersByProfile = useMemo(() => {
    const followerCounts: Record<string, number> = {};

    Object.values(followingByUser).forEach((profileIds) => {
      new Set(profileIds).forEach((profileId) => {
        followerCounts[profileId] = (followerCounts[profileId] ?? 0) + 1;
      });
    });

    return followerCounts;
  }, [followingByUser]);
  const followerUserIdsByProfile = useMemo(
    () => buildFollowerUserIdsByProfile(followingByUser),
    [followingByUser]
  );
  const currentMessageContacts = user
    ? messageContactsByUser[user.id] ?? []
    : [];
  const ownPlayer = user
    ? players.find((player) => player.ownerUserId === user.id)
    : undefined;
  const ownProfileId = user
    ? ownPlayer?.profileId ?? `profile-${user.id}`
    : undefined;

  function addMessageContact(contact: MessageContact) {
    if (!user) {
      return;
    }

    setMessageContactsByUser((current) => ({
      ...current,
      [user.id]: upsertMessageContact(current[user.id] ?? [], contact)
    }));
  }

  function sendDirectMessage(contactId: string, body: string) {
    const trimmedBody = body.trim();
    const contact = currentMessageContacts.find((item) => item.id === contactId);

    if (!user || !contact || !trimmedBody) {
      return;
    }

    const reciprocalContact: MessageContact = {
      id: user.id,
      profileId: ownPlayer?.profileId ?? `profile-${user.id}`,
      name: ownPlayer?.name ?? user.name,
      subtitle: ownPlayer
        ? `${ownPlayer.position} | ${ownPlayer.city}`
        : "Usuario NextStar",
      username: user.username
    };

    setDirectMessages((current) => [
      ...current,
      {
        body: trimmedBody,
        createdAt: new Date().toISOString(),
        id: `message-${Date.now()}-${current.length}`,
        recipientUserId: contact.id,
        senderUserId: user.id
      }
    ]);
    setMessageContactsByUser((current) => ({
      ...current,
      [user.id]: upsertMessageContact(current[user.id] ?? [], contact),
      [contact.id]: upsertMessageContact(
        current[contact.id] ?? [],
        reciprocalContact
      )
    }));
  }

  function toggleFollowProfile(profileId: string) {
    if (!user || profileId === ownProfileId) {
      return;
    }

    setFollowingByUser((current) => {
      const currentFollowing = current[user.id] ?? [];
      const isFollowing = currentFollowing.includes(profileId);

      return {
        ...current,
        [user.id]: isFollowing
          ? currentFollowing.filter((item) => item !== profileId)
          : [...currentFollowing, profileId]
      };
    });
  }

  return {
    addMessageContact,
    currentMessageContacts,
    directMessages,
    followersByProfile,
    followerUserIdsByProfile,
    followingProfileIds,
    followingProfileSet,
    ownProfileId,
    sendDirectMessage,
    toggleFollowProfile
  };
}
