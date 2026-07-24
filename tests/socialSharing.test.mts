import assert from "node:assert/strict";
import test from "node:test";
import type { AppUser, DirectMessage, Player } from "../src/types.ts";
import {
  createSharedPostReference,
  getSharedPostCaption,
  selectShareContacts
} from "../src/utils/socialSharing.ts";

const user: AppUser = {
  acceptedTerms: true,
  age: 18,
  bio: "Perfil completo usado pelo teste de compartilhamento.",
  city: "Sao Paulo, SP",
  club: "Projeto Teste",
  email: "jogador@xolot.test",
  id: "user-a",
  kycStatus: "Não iniciado",
  name: "Jogador A",
  position: "Ponta",
  profileCompleted: true,
  role: "Usuário",
  username: "jogadora"
};

const player: Player = {
  age: 18,
  city: "Sao Paulo, SP",
  club: "Projeto Teste",
  highlight: "Melhor lance",
  id: "player-b",
  mediaType: "video",
  name: "Jogador B",
  ownerUserId: "user-b",
  position: "Meia",
  profileId: "profile-user-b",
  tags: [],
  videoLength: "0:08",
  videoTitle: "Treino tecnico",
  videoUri: "video-b.mp4"
};

test("cria referencia persistente para uma publicacao compartilhada", () => {
  assert.deepEqual(createSharedPostReference(player), {
    authorName: player.name,
    mediaType: "video",
    playerId: player.id,
    profileId: player.profileId,
    title: player.videoTitle
  });
});

test("inclui uma mensagem opcional na referencia compartilhada", () => {
  assert.deepEqual(
    createSharedPostReference(player, "  Veja este lance  "),
    {
      authorName: player.name,
      caption: "Veja este lance",
      mediaType: "video",
      playerId: player.id,
      profileId: player.profileId,
      title: player.videoTitle
    }
  );
});
test("recupera a mensagem anexada pelo campo persistido ou pelo corpo", () => {
  const baseMessage: DirectMessage = {
    body: "Compartilhou uma publicacao",
    createdAt: "2026-07-24T00:00:00.000Z",
    id: "message-share",
    recipientUserId: "user-b",
    senderUserId: "user-a",
    sharedPost: createSharedPostReference(player, "Veja este lance")
  };

  assert.equal(getSharedPostCaption(baseMessage), "Veja este lance");
  assert.equal(
    getSharedPostCaption({
      ...baseMessage,
      body: "Mensagem recuperada pelo corpo",
      sharedPost: createSharedPostReference(player)
    }),
    "Mensagem recuperada pelo corpo"
  );
  assert.equal(
    getSharedPostCaption({
      ...baseMessage,
      sharedPost: createSharedPostReference(player)
    }),
    ""
  );
});


test("une conversas e perfis seguidos sem duplicar ou incluir a propria conta", () => {
  const contacts = selectShareContacts({
    contacts: [
      {
        id: "user-c",
        name: "Jogador C",
        profileId: "profile-user-c",
        subtitle: "Goleiro"
      },
      {
        id: user.id,
        name: user.name,
        profileId: `profile-${user.id}`,
        subtitle: "Sua conta"
      }
    ],
    currentUserId: user.id,
    followingProfileIds: [player.profileId, "profile-user-c"],
    players: [player],
    users: [user]
  });

  assert.deepEqual(
    contacts.map((contact) => contact.id),
    ["user-c", "user-b"]
  );
});
