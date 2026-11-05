import { getApps, initializeApp } from "firebase-admin/app";

// Só a composição inicializa Admin; importar casos de uso não acessa serviços.
if (!getApps().some((app) => app.name === "[DEFAULT]")) initializeApp();
