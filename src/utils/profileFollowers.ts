import type { FollowingByUser } from "../types";

export function buildFollowerUserIdsByProfile(
  followingByUser: FollowingByUser
) {
  const followerUserIdsByProfile: Record<string, string[]> = {};

  Object.entries(followingByUser).forEach(([userId, profileIds]) => {
    new Set(profileIds).forEach((profileId) => {
      const followers = followerUserIdsByProfile[profileId] ?? [];

      followerUserIdsByProfile[profileId] = [...followers, userId];
    });
  });

  return followerUserIdsByProfile;
}
