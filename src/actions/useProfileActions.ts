import { useEffect, useState } from "react";
import {
  loadProfileAvatars,
  saveProfileAvatars
} from "../services/profileStorage";
import { ProfileAvatar, ProfileAvatarsByProfile } from "../types";

export function useProfileActions() {
  const [profileAvatars, setProfileAvatars] =
    useState<ProfileAvatarsByProfile>({});
  const [isProfileStateLoaded, setIsProfileStateLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadProfileAvatars().then((storedAvatars) => {
      if (!isMounted) {
        return;
      }

      setProfileAvatars(storedAvatars);
      setIsProfileStateLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isProfileStateLoaded) {
      return;
    }

    saveProfileAvatars(profileAvatars).catch(() => undefined);
  }, [isProfileStateLoaded, profileAvatars]);

  function setProfileAvatar(profileId: string, avatar: ProfileAvatar | null) {
    if (!profileId) {
      return;
    }

    setProfileAvatars((current) => {
      if (avatar?.uri.trim()) {
        return { ...current, [profileId]: avatar };
      }

      const nextAvatars = { ...current };
      delete nextAvatars[profileId];
      return nextAvatars;
    });
  }

  return { profileAvatars, setProfileAvatar };
}
