import { Player } from "../types";

export const demoPlayer: Player = {
  id: "nextstar-demo-profile",
  name: "Perfil demonstrativo",
  age: 18,
  city: "Sao Paulo, SP",
  position: "Ponta",
  club: "Dados ilustrativos",
  videoTitle: "Treino tecnico",
  videoLength: "0:05",
  videoUri: require("../../assets/demo-football-feed.mp4"),
  hasAudio: false,
  isDemo: true,
  highlight:
    "Movimentacao, dominio e intensidade em uma sequencia curta de treino.",
  objective:
    "Este perfil demonstra como uma oportunidade avaliada aparece no NextStar.",
  tags: ["Demonstracao", "Treino", "Tecnica"],
  evaluation: {
    thesis:
      "Perfil e numeros exclusivamente ilustrativos para validar a experiencia do produto.",
    fundingGoal: 90000,
    funded: 31500,
    minimumTicket: 350,
    athleteSharePercent: 15,
    projectedMonthlyEarnings: 12000,
    score: 82,
    riskLevel: "Moderado",
    metrics: [
      { label: "Velocidade", value: "86" },
      { label: "Tecnica", value: "81" },
      { label: "Jogos", value: "24" }
    ]
  }
};
