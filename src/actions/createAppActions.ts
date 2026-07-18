import { Dispatch, SetStateAction } from "react";
import { Alert } from "react-native";
import {
  AccountProfile,
  AppUser,
  AthleteFund,
  Investment,
  Player,
  VideoSubmission,
  VideoSubmissionStatus
} from "../types";
import { Tab } from "../ui/types";
import { formatBRL } from "../utils/investment";
import { deleteStoredVideo } from "../services/videoStorage";
import { removeOwnedVideoSubmission } from "../utils/videoSubmission";

type CreateAppActionsOptions = {
  athleteFunds: AthleteFund[];
  registeredUsers: AppUser[];
  setAthleteFunds: Dispatch<SetStateAction<AthleteFund[]>>;
  setInvestments: Dispatch<SetStateAction<Investment[]>>;
  setRegisteredUsers: Dispatch<SetStateAction<AppUser[]>>;
  setSelectedAccount: Dispatch<SetStateAction<AppUser | null>>;
  setSelectedPlayer: Dispatch<SetStateAction<Player | null>>;
  setSubmissions: Dispatch<SetStateAction<VideoSubmission[]>>;
  setTab: Dispatch<SetStateAction<Tab>>;
  setUser: Dispatch<SetStateAction<AppUser | null>>;
  setWalletBalances: Dispatch<SetStateAction<Record<string, number>>>;
  user: AppUser | null;
  walletBalance: number;
};

export function createAppActions({
  athleteFunds,
  registeredUsers,
  setAthleteFunds,
  setInvestments,
  setRegisteredUsers,
  setSelectedAccount,
  setSelectedPlayer,
  setSubmissions,
  setTab,
  setUser,
  setWalletBalances,
  user,
  walletBalance
}: CreateAppActionsOptions) {
  function handleAuth(nextUser: AppUser) {
    setRegisteredUsers((current) => {
      const accountExists = current.some((item) => item.id === nextUser.id);

      return accountExists
        ? current.map((item) => (item.id === nextUser.id ? nextUser : item))
        : [nextUser, ...current];
    });

    setSelectedAccount(null);
    setSelectedPlayer(null);
    setUser(nextUser);
    setTab(nextUser.role === "Admin" ? "admin" : "feed");
  }

  function handleUpdateProfile(profile: AccountProfile) {
    if (!user) {
      return;
    }

    const updatedUser: AppUser = {
      ...user,
      ...profile,
      profileCompleted: true
    };

    setUser(updatedUser);
    setRegisteredUsers((current) =>
      current.some((account) => account.id === updatedUser.id)
        ? current.map((account) =>
            account.id === updatedUser.id ? updatedUser : account
          )
        : [updatedUser, ...current]
    );
  }

  function handleSignOut() {
    void import("../services/googleAuth").then(({ signOutFromGoogle }) =>
      signOutFromGoogle()
    );
    setSelectedAccount(null);
    setSelectedPlayer(null);
    setUser(null);
    setTab("feed");
  }

  function handleInvest(player: Player, amount: number) {
    const fund = athleteFunds.find(
      (item) => item.profileId === player.profileId
    );

    if (!fund) {
      Alert.alert(
        "Bolsa indisponivel",
        "Este perfil ainda nao abriu uma bolsa de investimento."
      );
      return;
    }

    if (fund.status === "Concluida") {
      Alert.alert(
        "Bolsa concluida",
        "A meta deste perfil ja foi atingida e novos aportes estao bloqueados."
      );
      return;
    }

    const remainingAmount = Math.max(0, fund.goalAmount - fund.fundedAmount);

    if (amount < fund.minimumContribution || amount > remainingAmount) {
      Alert.alert(
        "Valor invalido",
        `O aporte deve ficar entre ${formatBRL(fund.minimumContribution)} e ${formatBRL(remainingAmount)}.`
      );
      return;
    }

    if (amount > walletBalance) {
      Alert.alert(
        "Saldo insuficiente",
        `Seu saldo disponivel e ${formatBRL(walletBalance)}. Abra a Carteira pelo menu do Perfil e deposite um valor simulado antes de criar a reserva.`
      );
      return;
    }

    const nextFundedAmount = Math.min(
      fund.goalAmount,
      fund.fundedAmount + amount
    );
    const isFundComplete = nextFundedAmount >= fund.goalAmount;

    setInvestments((current) => [
      {
        id: `simulation-${Date.now()}`,
        fundId: fund.id,
        investorUserId: user?.id ?? "",
        profileId: player.profileId,
        playerName: player.name,
        amount,
        sharePercent: (amount / fund.goalAmount) * 100,
        status: "Confirmada",
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    setAthleteFunds((current) =>
      current.map((item) =>
        item.id === fund.id
          ? {
              ...item,
              fundedAmount: nextFundedAmount,
              status: isFundComplete ? "Concluida" : "Captando",
              completedAt: isFundComplete
                ? new Date().toISOString()
                : item.completedAt
            }
          : item
      )
    );
    if (user) {
      setWalletBalances((current) => ({
        ...current,
        [user.id]: Math.max(0, (current[user.id] ?? 0) - amount)
      }));
    }
    setSelectedPlayer(null);
    setTab("profile");
    Alert.alert(
      isFundComplete ? "Bolsa concluida" : "Transferencia confirmada",
      isFundComplete
        ? "A meta do atleta foi atingida. O perfil agora aparece como em busca de contratantes."
        : `${formatBRL(amount)} foram transferidos para a bolsa de ${player.name}.`
    );
  }

  function handleDeposit(amount: number) {
    if (!user) {
      return;
    }

    setWalletBalances((current) => ({
      ...current,
      [user.id]: (current[user.id] ?? 0) + amount
    }));
  }

  function handleOpenFund(
    player: Player,
    goalAmount: number,
    minimumContribution: number
  ) {
    if (athleteFunds.some((item) => item.profileId === player.profileId)) {
      Alert.alert("Bolsa ja existente", "Este perfil ja possui uma bolsa aberta.");
      return;
    }

    setAthleteFunds((current) => [
      {
        id: `athlete-fund-${Date.now()}`,
        profileId: player.profileId,
        ownerUserId: player.ownerUserId ?? user?.id ?? "",
        athleteName: player.name,
        goalAmount,
        fundedAmount: 0,
        minimumContribution,
        status: "Captando",
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
  }

  function handleSubmitVideo(submission: VideoSubmission) {
    setSubmissions((current) => [submission, ...current]);
  }

  async function handleDeleteVideo(submission: VideoSubmission) {
    if (!user || submission.userId !== user.id) {
      return false;
    }

    setSubmissions((current) =>
      removeOwnedVideoSubmission(current, submission.id, user.id)
    );
    await deleteStoredVideo(submission.videoLink).catch(() => false);

    return true;
  }

  function handleReviewSubmission(
    submissionId: string,
    status: VideoSubmissionStatus,
    reviewNote: string
  ) {
    setSubmissions((current) =>
      current.map((submission) => {
        if (submission.id !== submissionId) {
          return submission;
        }

        return {
          ...submission,
          status,
          reviewNote,
          approvedAt:
            status === "Aprovado"
              ? new Date().toISOString()
              : submission.approvedAt
        };
      })
    );
  }

  return {
    handleAuth,
    handleDeleteVideo,
    handleDeposit,
    handleInvest,
    handleOpenFund,
    handleReviewSubmission,
    handleSignOut,
    handleSubmitVideo,
    handleUpdateProfile
  };
}
