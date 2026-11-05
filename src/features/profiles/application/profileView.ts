import type { PublicProfileDocument, SocialUser } from "../domain/types";

export function toSocialUser(profile: PublicProfileDocument): SocialUser {
  return {
    id: profile.uid,
    age: profile.age,
    bio: profile.bio,
    city: profile.city,
    club: profile.club,
    interestTags: profile.interestTags,
    name: profile.name,
    photoURL: profile.photoURL || undefined,
    identityVerified: profile.identityVerified,
    plusActive: profile.plusActive,
    sport: profile.sport,
    position: profile.position,
    profileCompleted: true,
    username: profile.username,
    role: "Usuário",
  };
}
