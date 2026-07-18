import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AppUser, Player } from "../types.ts";
import type { Tab } from "../ui/types.ts";

export type ReelReturnTarget =
  | { type: "own-profile" }
  | { account?: AppUser; player: Player; type: "public-profile" };

export function useAppNavigation() {
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AppUser | null>(null);
  const [investmentPlayer, setInvestmentPlayer] = useState<Player | null>(null);
  const [feedFocusPlayerId, setFeedFocusPlayerId] = useState<string | null>(null);
  const [reelReturnTarget, setReelReturnTarget] =
    useState<ReelReturnTarget | null>(null);
  const [activeMessageContactId, setActiveMessageContactId] = useState<
    string | null
  >(null);

  const clearSelectedProfile = useCallback(() => {
    setSelectedAccount(null);
    setSelectedPlayer(null);
  }, []);

  const openPlayerProfile = useCallback((player: Player) => {
    setReelReturnTarget(null);
    setSelectedAccount(null);
    setSelectedPlayer(player);
  }, []);

  const openUserProfile = useCallback((account: AppUser) => {
    setSelectedPlayer(null);
    setSelectedAccount(account);
  }, []);

  const closeInvestment = useCallback(() => {
    setInvestmentPlayer(null);
  }, []);

  const openInvestment = useCallback((player: Player) => {
    setInvestmentPlayer(player);
  }, []);

  const openTab = useCallback((nextTab: Tab) => {
    setInvestmentPlayer(null);
    setReelReturnTarget(null);
    setSelectedAccount(null);
    setSelectedPlayer(null);
    setTab(nextTab);
  }, []);

  const openReel = useCallback(
    (player: Player, returnTarget: ReelReturnTarget | null = null) => {
      setInvestmentPlayer(null);
      setReelReturnTarget(returnTarget);
      setSelectedAccount(null);
      setSelectedPlayer(null);
      setFeedFocusPlayerId(player.id);
      setTab("feed");
    },
    []
  );

  const returnToReelOrigin = useCallback(() => {
    if (!reelReturnTarget) {
      return;
    }

    const returnTarget = reelReturnTarget;

    setReelReturnTarget(null);
    if (returnTarget.type === "own-profile") {
      setTab("profile");
      return;
    }

    setSelectedAccount(returnTarget.account ?? null);
    setSelectedPlayer(returnTarget.player);
  }, [reelReturnTarget]);

  const openMessageContact = useCallback((contactId: string) => {
    setActiveMessageContactId(contactId);
    setInvestmentPlayer(null);
    setSelectedAccount(null);
    setSelectedPlayer(null);
    setTab("messages");
  }, []);

  const resetSessionNavigation = useCallback(() => {
    setActiveMessageContactId(null);
  }, []);

  const focusFeedPlayer = useCallback((playerId: string) => {
    setFeedFocusPlayerId(playerId);
  }, []);

  return {
    activeMessageContactId,
    clearSelectedProfile,
    closeInvestment,
    feedFocusPlayerId,
    focusFeedPlayer,
    investmentPlayer,
    openInvestment,
    openMessageContact,
    openPlayerProfile,
    openReel,
    openTab,
    openUserProfile,
    reelReturnTarget,
    resetSessionNavigation,
    returnToReelOrigin,
    selectedAccount,
    selectedPlayer,
    setActiveMessageContactId:
      setActiveMessageContactId as Dispatch<SetStateAction<string | null>>,
    setSelectedAccount:
      setSelectedAccount as Dispatch<SetStateAction<AppUser | null>>,
    setSelectedPlayer:
      setSelectedPlayer as Dispatch<SetStateAction<Player | null>>,
    setTab: setTab as Dispatch<SetStateAction<Tab>>,
    tab
  };
}
