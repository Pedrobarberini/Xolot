import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const accountFunction = readFileSync(
  new URL("../functions/src/account.ts", import.meta.url),
  "utf8",
);
const accountDeletionFunction = readFileSync(
  new URL("../functions/src/accountDeletion.ts", import.meta.url),
  "utf8",
);
const accountService = ["firebaseAccountGateway.ts", "firebaseRegistration.ts"].map((file) => readFileSync(
  new URL(`../src/features/auth/data/${file}`, import.meta.url), "utf8",
)).join("\n");
const authScreen = readFileSync(
  new URL("../src/screens/AuthScreen.tsx", import.meta.url),
  "utf8",
);
const profileScreen = readFileSync(
  new URL("../src/screens/ProfileScreen.tsx", import.meta.url),
  "utf8",
);
const discoveryScreen = readFileSync(
  new URL("../src/screens/ProfileDiscoveryScreen.tsx", import.meta.url),
  "utf8",
);
const accountSetupScreen = readFileSync(
  new URL("../src/screens/AccountSetupScreen.tsx", import.meta.url),
  "utf8",
);
const accountSetupStyles = readFileSync(
  new URL("../src/styles/app/accountAvatarSettingsStyles.ts", import.meta.url),
  "utf8",
);

test("conclusao da conta ocorre no servidor para uma identidade verificada", () => {
  assert.match(accountFunction, /requireVerifiedUser\(request\)/);
  assert.match(accountFunction, /pendingAccounts\/\$\{uid\}/);
  assert.match(accountFunction, /request\.data\?\.acceptedTerms === true/);
  assert.match(accountFunction, /transaction\.create\(accountReference/);
  assert.match(accountFunction, /transaction\.delete\(pendingReference\)/);
});

test("exclusao da conta remove identidade e agenda limpeza autoritativa", () => {
  assert.match(accountDeletionFunction, /deleteOwnAccount/);
  assert.ok(accountDeletionFunction.includes(".auth.user()"));
  assert.ok(accountDeletionFunction.includes(".onDelete(async (user)"));
  assert.match(accountDeletionFunction, /cancelPlusSubscriptionForAccountDeletion/);
  assert.equal(accountDeletionFunction.includes('database.collection("posts").where("authorId"'), true);
  assert.match(accountDeletionFunction, /DeleteObjectsCommand/);
  assert.match(accountDeletionFunction, /recursiveDelete/);
  assert.match(accountService, /deleteCurrentFirebaseAccount/);
  assert.match(profileScreen, /Excluir minha conta/);
  assert.match(profileScreen, /DeleteAccountModal/);
});

test("login recupera cadastro incompleto pela Function autenticada", () => {
  assert.match(accountService, /finalizeAccountRegistration/);
  assert.match(accountService, /AccountCompletionRequiredError/);
  assert.match(accountService, /getIdToken\(true\)/);
});

test("busca abre em sugestoes e consulta todas as contas quando ha texto", () => {
  assert.match(discoveryScreen, /useState<SearchMode>\("suggestions"\)/);
  assert.match(discoveryScreen, /normalizedQuery\s*\? allProfiles\.filter/);
});

test("Google no login cria uma conta nova somente depois do aceite dos termos", () => {
  assert.match(authScreen, /mode === "login" && !needsGoogleAccountCompletion/);
  assert.match(authScreen, /setNeedsGoogleAccountCompletion\(true\)/);
  assert.match(authScreen, /completeCurrentFirebaseAccountRegistration\(true\)/);
  assert.match(authScreen, /Aceitar e continuar/);
  assert.doesNotMatch(
    authScreen,
    /Esta identidade ainda não possui uma conta Xolot\. Selecione/
  );
  assert.match(
    accountService,
    /completeCurrentFirebaseAccountRegistration[\s\S]*activateVerifiedFirebaseAccount\(authenticatedUser, true\)/
  );
});

test("servidor exige aceite explícito quando não há cadastro pendente válido", () => {
  assert.match(
    accountFunction,
    /if \(!hasValidPendingAccount && !acceptedTerms\)/
  );
});

test("onboarding divide identidade, atuação e interesses em etapas curtas", () => {
  assert.match(accountSetupScreen, /Etapa \{currentStep \+ 1\} de/);
  assert.match(accountSetupScreen, /Vamos criar seu perfil/);
  assert.match(accountSetupScreen, /Monte seu Para você/);
  assert.match(accountSetupScreen, /<TagPicker/);
  assert.match(accountSetupScreen, /onCreateTag=\{onCreateTag\}/);
  assert.match(accountSetupScreen, /pickProfilePhoto/);
  assert.equal(accountSetupScreen.includes("cleanProfile.club.length >= 2"), false);
  assert.match(accountSetupScreen, /animateToStep/);
  assert.equal(accountSetupScreen.includes("styles.accountSetupFooter"), true);
  assert.equal(accountSetupStyles.includes("accountSetupStepViewport:"), true);
  assert.match(accountSetupStyles, /accountSetupFooter:/);
  assert.match(accountSetupScreen, /backButtonProgress\.interpolate/);
  assert.match(accountSetupScreen, /outputRange: \[0, 3\]/);
  assert.match(accountSetupScreen, /outputRange: \[10, 7\]/);
  assert.equal(accountSetupStyles.includes("accountSetupActionSlot:"), true);
});
