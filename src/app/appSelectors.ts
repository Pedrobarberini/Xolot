import { buildPlayerFromSubmission } from "../actions/appActions.ts";
import type {
  AppUser,
  AthleteFund,
  Investment,
  Player,
  VideoSubmission
} from "../types.ts";
import { getPlayerContentKey } from "../utils/feedEngagement.ts";

export function selectApprovedSubmissionPlayers(
  submissions: VideoSubmission[],
  registeredUsers: AppUser[]
) {
  return submissions
    .filter(
      (submission) =>
        submission.status === "Aprovado" &&
        submission.videoLink.trim().length > 0
    )
    .map(buildPlayerFromSubmission)
    .map((player) => {
      const account = player.ownerUserId
        ? registeredUsers.find((item) => item.id === player.ownerUserId)
        : undefined;

      if (!account?.profileCompleted) {
        return player;
      }

      return {
        ...player,
        age: account.age ?? player.age,
        city: account.city,
        club: account.club,
        name: account.name,
        position: account.position,
        username: account.username
      };
    });
}

export function selectAvailablePlayers(
  approvedSubmissionPlayers: Player[],
  demoPlayer: Player
) {
  return approvedSubmissionPlayers.length > 0
    ? approvedSubmissionPlayers
    : [demoPlayer];
}

export function selectOrderedFeedPlayers(
  availablePlayers: Player[],
  followingProfileSet: Set<string>,
  interestedContentKeySet = new Set<string>()
) {
  return availablePlayers
    .map((player, index) => ({ index, player }))
    .sort((left, right) => {
      const followDifference =
        Number(followingProfileSet.has(right.player.profileId)) -
        Number(followingProfileSet.has(left.player.profileId));
      const interestDifference =
        Number(
          interestedContentKeySet.has(getPlayerContentKey(right.player))
        ) -
        Number(
          interestedContentKeySet.has(getPlayerContentKey(left.player))
        );

      return followDifference || interestDifference || left.index - right.index;
    })
    .map(({ player }) => player);
}

export function selectPendingReviews(submissions: VideoSubmission[]) {
  return submissions.filter((submission) => submission.status === "Em revisão")
    .length;
}

export function selectCurrentUserInvestments(
  investments: Investment[],
  user: AppUser | null
) {
  return user
    ? investments.filter((investment) => investment.investorUserId === user.id)
    : [];
}

export function selectProfileAccount(
  selectedAccount: AppUser | null,
  selectedPlayer: Player | null,
  registeredUsers: AppUser[]
) {
  return selectedAccount ?? (
    selectedPlayer?.ownerUserId
      ? registeredUsers.find(
          (account) => account.id === selectedPlayer.ownerUserId
        )
      : undefined
  );
}

export function selectProfileVideos(
  selectedPlayer: Player | null,
  availablePlayers: Player[]
) {
  return selectedPlayer
    ? availablePlayers.filter(
        (player) => player.profileId === selectedPlayer.profileId
      )
    : [];
}

export function selectProfileFund(
  selectedPlayer: Player | null,
  athleteFunds: AthleteFund[]
) {
  return selectedPlayer
    ? athleteFunds.find((fund) => fund.profileId === selectedPlayer.profileId)
    : undefined;
}

export function selectProfileFollowers(
  profileId: string | null | undefined,
  followerUserIdsByProfile: Record<string, string[]>,
  registeredUsers: AppUser[]
) {
  if (!profileId) {
    return [];
  }

  const followerUserIds = new Set(followerUserIdsByProfile[profileId] ?? []);

  return registeredUsers.filter((account) => followerUserIds.has(account.id));
}

export function selectProfileFollowing(
  followingProfileIds: string[],
  registeredUsers: AppUser[]
) {
  const accountsByProfileId = new Map(
    registeredUsers.map((account) => [`profile-${account.id}`, account])
  );
  const selectedAccounts: AppUser[] = [];
  const selectedAccountIds = new Set<string>();

  followingProfileIds.forEach((profileId) => {
    const account = accountsByProfileId.get(profileId);

    if (account && !selectedAccountIds.has(account.id)) {
      selectedAccounts.push(account);
      selectedAccountIds.add(account.id);
    }
  });

  return selectedAccounts;
}

export function selectFundByOwner(
  athleteFunds: AthleteFund[],
  ownerUserId: string
) {
  return athleteFunds.find((fund) => fund.ownerUserId === ownerUserId);
}

export function selectInvestmentFund(
  investmentPlayer: Player | null,
  athleteFunds: AthleteFund[]
) {
  return investmentPlayer
    ? athleteFunds.find((fund) => fund.profileId === investmentPlayer.profileId)
    : undefined;
}

export function selectProfileId(
  selectedPlayer: Player | null,
  selectedAccount: AppUser | undefined
) {
  return selectedPlayer?.profileId ??
    (selectedAccount ? `profile-${selectedAccount.id}` : undefined);
}

export function selectVisibleFeedPlayers(
  availablePlayers: Player[],
  hiddenPlayerIdSet: Set<string>,
  focusPlayerId?: string | null,
  blockedProfileIdSet = new Set<string>(),
  mutedContentKeySet = new Set<string>()
) {
  return availablePlayers.filter(
    (player) => {
      if (player.id === focusPlayerId) {
        return true;
      }

      return (
        !hiddenPlayerIdSet.has(player.id) &&
        !blockedProfileIdSet.has(player.profileId) &&
        !mutedContentKeySet.has(getPlayerContentKey(player))
      );
    }
  );
}

export function isOwnAccountProfile(account: AppUser, currentUserId: string) {
  return account.id === currentUserId;
}

export function isOwnPlayerProfile(
  player: Player,
  currentUserId: string,
  ownProfileId?: string | null
) {
  return (
    player.ownerUserId === currentUserId ||
    Boolean(ownProfileId && player.profileId === ownProfileId)
  );
}

export function selectPlayerByOwner(
  players: Player[],
  ownerUserId: string
) {
  return players.find((player) => player.ownerUserId === ownerUserId);
}

export function selectApprovedPlayerForSubmission(
  approvedSubmissionPlayers: Player[],
  submissionId: string
) {
  return approvedSubmissionPlayers.find(
    (player) => player.id === `approved-${submissionId}`
  );
}

export function selectUserSubmissions(
  submissions: VideoSubmission[],
  userId: string
) {
  return submissions.filter((submission) => submission.userId === userId);
}
