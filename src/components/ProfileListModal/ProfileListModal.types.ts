import type { ProfileAvatar } from "../../types";

export type ProfileListItemData = {
  avatar?: ProfileAvatar;
  id: string;
  name: string;
  subtitle: string;
  username?: string;
};
