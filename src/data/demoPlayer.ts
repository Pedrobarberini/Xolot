import { Player } from "../types";

export const demoPlayer: Player = {
  id: "nextstar-demo-profile",
  profileId: "nextstar-demo-profile",
  name: "Perfil demonstrativo",
  username: "xolot.demo",
  age: 18,
  city: "São Paulo, SP",
  position: "Ponta",
  club: "Sem clube informado",
  videoTitle: "Treino técnico",
  videoLength: "0:05",
  videoUri: require("../../assets/demo-football-feed.mp4"),
  hasAudio: false,
  isDemo: true,
  highlight:
    "Movimentacao, dominio e intensidade em uma sequencia curta de treino.",
  tags: ["Demonstracao", "Treino", "Tecnica"]
};
