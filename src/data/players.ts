import { Player } from "../types";

export const players: Player[] = [
  {
    id: "mateus-silva",
    name: "Mateus Silva",
    age: 17,
    city: "Santos, SP",
    position: "Ponta direita",
    club: "Base Sub-20",
    videoTitle: "Arrancadas e 1x1 pela direita",
    videoLength: "1:42",
    highlight: "Aceleracao forte, bom dominio em velocidade e finalizacao cruzada.",
    thesis:
      "Perfil de ponta agressivo, com evolucao clara em tomada de decisao. O proximo salto depende de minutos em competicao adulta.",
    fundingGoal: 120000,
    funded: 73500,
    minimumTicket: 500,
    athleteSharePercent: 15,
    projectedMonthlyEarnings: 18000,
    score: 86,
    riskLevel: "Moderado",
    tags: ["Velocidade", "Drible", "Base forte"],
    metrics: [
      { label: "Gols", value: "14" },
      { label: "Assist.", value: "9" },
      { label: "Jogos", value: "28" }
    ],
    thumbnailColor: "#0D0B07",
    accentColor: "#D6A326"
  },
  {
    id: "caio-rocha",
    name: "Caio Rocha",
    age: 19,
    city: "Recife, PE",
    position: "Meia central",
    club: "Serie B estadual",
    videoTitle: "Passe vertical e controle de ritmo",
    videoLength: "2:08",
    highlight: "Boa leitura entre linhas, passe progressivo e lideranca em campo.",
    thesis:
      "Meia com perfil organizador. Pode atrair clubes maiores se mantiver volume de passes verticais e regularidade fisica.",
    fundingGoal: 90000,
    funded: 41400,
    minimumTicket: 350,
    athleteSharePercent: 15,
    projectedMonthlyEarnings: 12000,
    score: 81,
    riskLevel: "Moderado",
    tags: ["Passe", "Visao", "Lideranca"],
    metrics: [
      { label: "Chances", value: "37" },
      { label: "Precisao", value: "88%" },
      { label: "Jogos", value: "31" }
    ],
    thumbnailColor: "#0D0B07",
    accentColor: "#D6A326"
  },
  {
    id: "leo-martins",
    name: "Leo Martins",
    age: 16,
    city: "Goiania, GO",
    position: "Zagueiro",
    club: "Projeto parceiro",
    videoTitle: "Antecipacao e duelos defensivos",
    videoLength: "1:25",
    highlight: "Zagueiro canhoto, bom tempo de bote e passe curto seguro.",
    thesis:
      "Ativo de longo prazo. O risco e maior pela idade, mas o perfil fisico e a perna canhota aumentam a escassez da posicao.",
    fundingGoal: 70000,
    funded: 18200,
    minimumTicket: 250,
    athleteSharePercent: 15,
    projectedMonthlyEarnings: 8000,
    score: 74,
    riskLevel: "Alto",
    tags: ["Canhoto", "Forca", "Antecipacao"],
    metrics: [
      { label: "Duelos", value: "71%" },
      { label: "Cortes", value: "6.2" },
      { label: "Jogos", value: "19" }
    ],
    thumbnailColor: "#0D0B07",
    accentColor: "#D6A326"
  }
];
