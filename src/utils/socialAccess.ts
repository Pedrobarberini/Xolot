export function canExchangeDirectMessages(
  currentUserId: string,
  contactUserId: string,
  isFollowing: boolean
) {
  return currentUserId === contactUserId || isFollowing;
}
