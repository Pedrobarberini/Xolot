import assert from "node:assert/strict";
import test from "node:test";
import {
  isOwnAccountProfile,
  isOwnPlayerProfile,
  selectApprovedSubmissionPlayers,
  selectApprovedPlayerForSubmission,
  selectAvailablePlayers,
  selectCurrentUserInvestments,
  selectFundByOwner,
  selectInvestmentFund,
  selectOrderedFeedPlayers,
  selectPendingReviews,
  selectPlayerByOwner,
  selectProfileAccount,
  selectProfileFollowers,
  selectProfileFollowing,
  selectProfileFund,
  selectProfileId,
  selectProfileVideos,
  selectUserSubmissions,
  selectVisibleFeedPlayers
} from "../src/app/appSelectors.ts";
import type {
  AppUser,
  AthleteFund,
  Player,
  VideoSubmission
} from "../src/types.ts";

const demoPlayer: Player = {
  age: 18,
  city: "São Paulo, SP",
  club: "Projeto Demo",
  highlight: "Demo",
  id: "demo",
  isDemo: true,
  name: "Demo",
  position: "Ponta",
  profileId: "profile-demo",
  tags: ["Demo"],
  videoLength: "0:05",
  videoTitle: "Demo",
  videoUri: "demo.mp4"
};

const completeUser: AppUser = {
  acceptedTerms: true,
  age: 17,
  bio: "Atleta completo para teste dos seletores.",
  city: "Rio de Janeiro, RJ",
  club: "Projeto Teste",
  email: "atleta@nextstar.local",
  id: "usuario-atleta",
  kycStatus: "Não iniciado",
  name: "Atleta Completo",
  position: "Meia",
  profileCompleted: true,
  role: "Usuário",
  username: "atleta"
};

const otherCompleteUser: AppUser = {
  ...completeUser,
  email: "latéral@nextstar.local",
  id: "usuario-lateral",
  name: "Latéral Completo",
  username: "latéral"
};

const approvedSubmission: VideoSubmission = {
  age: 18,
  athleteName: "Nome do Envio",
  city: "São Paulo, SP",
  club: "Clube do Envio",
  hasGuardianConsent: false,
  highlight: "Texto da publicação",
  id: "video-aprovado",
  position: "Ponta",
  status: "Aprovado",
  submittedAt: "2026-07-18T12:00:00.000Z",
  userId: completeUser.id,
  videoLink: "https://nextstar.test/video.mp4",
  videoTitle: "Melhores lances"
};

test("seleciona vídeos aprovados e aplica dados do perfil completo", () => {
  const players = selectApprovedSubmissionPlayers(
    [
      approvedSubmission,
      {
        ...approvedSubmission,
        id: "video-pendente",
        status: "Em revisão"
      },
      {
        ...approvedSubmission,
        id: "video-sem-link",
        videoLink: " "
      }
    ],
    [completeUser]
  );

  assert.equal(players.length, 1);
  assert.equal(players[0]?.id, "approved-video-aprovado");
  assert.equal(players[0]?.name, completeUser.name);
  assert.equal(players[0]?.username, completeUser.username);
  assert.equal(players[0]?.position, completeUser.position);
  assert.equal(players[0]?.mediaType, "video");
  assert.deepEqual(players[0]?.tags, ["Novo", "Publicado"]);
});

test("preserva tipo, tags e marcacoes de uma publicacao com foto", () => {
  const [player] = selectApprovedSubmissionPlayers(
    [
      {
        ...approvedSubmission,
        id: "foto-aprovada",
        mediaType: "image",
        mentions: ["projeto.nextstar"],
        tags: ["Treino", "Base"],
        videoLink: "https://nextstar.test/foto.jpg"
      }
    ],
    [completeUser]
  );

  assert.equal(player?.mediaType, "image");
  assert.equal(player?.hasAudio, false);
  assert.deepEqual(player?.tags, ["Treino", "Base"]);
  assert.deepEqual(player?.mentions, ["projeto.nextstar"]);
});

test("usa demo somente quando não existem players aprovados", () => {
  assert.deepEqual(selectAvailablePlayers([], demoPlayer), [demoPlayer]);
  assert.deepEqual(
    selectAvailablePlayers([{ ...demoPlayer, id: "real" }], demoPlayer).map(
      (player) => player.id
    ),
    ["real"]
  );
});

test("prioriza perfis seguidos sem alterar a ordem relativa dos demais", () => {
  const players = [
    { ...demoPlayer, id: "a", profileId: "profile-a" },
    { ...demoPlayer, id: "b", profileId: "profile-b" },
    { ...demoPlayer, id: "c", profileId: "profile-c" }
  ];

  assert.deepEqual(
    selectOrderedFeedPlayers(players, new Set(["profile-c"])).map(
      (player) => player.id
    ),
    ["c", "a", "b"]
  );
});

test("oculta players do Inicio e preserva o player aberto diretamente", () => {
  const players = [
    { ...demoPlayer, id: "a" },
    { ...demoPlayer, id: "b" },
    { ...demoPlayer, id: "c" }
  ];
  const hiddenPlayerIds = new Set(["b", "c"]);

  assert.deepEqual(
    selectVisibleFeedPlayers(players, hiddenPlayerIds).map(
      (player) => player.id
    ),
    ["a"]
  );
  assert.deepEqual(
    selectVisibleFeedPlayers(players, hiddenPlayerIds, "c").map(
      (player) => player.id
    ),
    ["a", "c"]
  );
});

test("identifica a própria conta e o próprio perfil de atleta", () => {
  const ownPlayer = {
    ...demoPlayer,
    ownerUserId: completeUser.id,
    profileId: `profile-${completeUser.id}`
  };

  assert.equal(isOwnAccountProfile(completeUser, completeUser.id), true);
  assert.equal(isOwnAccountProfile(otherCompleteUser, completeUser.id), false);
  assert.equal(
    isOwnPlayerProfile(ownPlayer, completeUser.id, ownPlayer.profileId),
    true
  );
  assert.equal(
    isOwnPlayerProfile(
      { ...ownPlayer, ownerUserId: otherCompleteUser.id },
      completeUser.id,
      ownPlayer.profileId
    ),
    true
  );
  assert.equal(
    isOwnPlayerProfile(
      {
        ...ownPlayer,
        ownerUserId: otherCompleteUser.id,
        profileId: `profile-${otherCompleteUser.id}`
      },
      completeUser.id,
      ownPlayer.profileId
    ),
    false
  );
});

test("seleciona dados derivados de perfil, fundos e usuário atual", () => {
  const player = {
    ...demoPlayer,
    id: "video-atleta",
    ownerUserId: completeUser.id,
    profileId: `profile-${completeUser.id}`
  };
  const fund: AthleteFund = {
    athleteName: completeUser.name,
    createdAt: "2026-07-18T12:00:00.000Z",
    fundedAmount: 0,
    goalAmount: 5000,
    id: "fund-atleta",
    minimumContribution: 50,
    ownerUserId: completeUser.id,
    profileId: player.profileId,
    status: "Captando"
  };

  assert.equal(
    selectPendingReviews([{ ...approvedSubmission, status: "Em revisão" }]),
    1
  );
  assert.deepEqual(
    selectCurrentUserInvestments(
      [
        {
          amount: 100,
          createdAt: "2026-07-18T12:00:00.000Z",
          fundId: fund.id,
          id: "investment-1",
          investorUserId: completeUser.id,
          playerName: completeUser.name,
          profileId: player.profileId,
          sharePercent: 2,
          status: "Confirmada"
        }
      ],
      completeUser
    ).map((investment) => investment.id),
    ["investment-1"]
  );
  assert.equal(selectProfileAccount(null, player, [completeUser])?.id, completeUser.id);
  assert.deepEqual(
    selectProfileFollowers(
      player.profileId,
      { [player.profileId]: [completeUser.id, "usuario-ausente"] },
      [completeUser]
    ),
    [completeUser]
  );
  assert.deepEqual(
    selectProfileFollowing(
      [
        `profile-${otherCompleteUser.id}`,
        player.profileId,
        "profile-ausente",
        player.profileId
      ],
      [completeUser, otherCompleteUser]
    ),
    [otherCompleteUser, completeUser]
  );
  assert.deepEqual(selectProfileVideos(player, [demoPlayer, player]), [player]);
  assert.equal(selectProfileFund(player, [fund]), fund);
  assert.equal(selectFundByOwner([fund], completeUser.id), fund);
  assert.equal(selectInvestmentFund(player, [fund]), fund);
  assert.equal(selectProfileId(player, completeUser), player.profileId);
  assert.equal(selectPlayerByOwner([demoPlayer, player], completeUser.id), player);
  assert.equal(
    selectApprovedPlayerForSubmission([player], "video-atleta"),
    undefined
  );
  assert.equal(
    selectApprovedPlayerForSubmission(
      [{ ...player, id: "approved-video-aprovado" }],
      approvedSubmission.id
    )?.id,
    "approved-video-aprovado"
  );
  assert.deepEqual(
    selectUserSubmissions([approvedSubmission], completeUser.id),
    [approvedSubmission]
  );
});
