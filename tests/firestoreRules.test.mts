import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
const socialFunctions = readFileSync(
  new URL("../functions/src/social.ts", import.meta.url),
  "utf8"
);
const socialService = readFileSync(
  new URL("../src/services/firebaseSocialService.ts", import.meta.url),
  "utf8"
);
const mercadoPagoFunctions = readFileSync(
  new URL("../functions/src/mercadoPago.ts", import.meta.url),
  "utf8"
);
const profileScreen = readFileSync(
  new URL("../src/screens/ProfileScreen.tsx", import.meta.url),
  "utf8"
);
const appRoutes = readFileSync(
  new URL("../src/app/AppRoutes.tsx", import.meta.url),
  "utf8"
);
const notificationFunctions = readFileSync(
  new URL("../functions/src/notifications.ts", import.meta.url),
  "utf8"
);

test("regras do Firestore exigem conta registrada, email verificado e deny by default", () => {
  assert.match(rules, /rules_version = '2'/);
  assert.match(rules, /request\.auth\.token\.email_verified == true/);
  assert.match(rules, /function registeredVerifiedUser/);
  assert.match(rules, /documents\/accounts\/\$\(request\.auth\.uid\)/);
  assert.match(rules, /documents\/profiles\/\$\(request\.auth\.uid\)/);
  assert.match(rules, /return registeredVerifiedUser\(\) && request\.auth\.uid == uid/);
  assert.match(rules, /match \/\{document=\*\*\}/);
  assert.match(rules, /allow read, write: if false/);
});

test("documentos privados não podem ser listados ou alterados pelo cliente", () => {
  assert.match(rules, /match \/accounts\/\{uid\}/);
  assert.match(rules, /allow list: if false/);
  assert.match(rules, /allow update, delete: if false/);
  assert.match(rules, /authProvider.*createdAt.*termsAcceptedAt.*uid/s);
});

test("cadastro por email permanece pendente ate o token confirmar o endereco", () => {
  assert.match(rules, /match \/pendingAccounts\/\{uid\}/);
  assert.match(rules, /request\.auth\.token\.email_verified == false/);
  assert.match(rules, /sign_in_provider == 'password'/);
  assert.match(rules, /allow create: if verifiedUser\(\)/);
  assert.match(rules, /verifiedPendingPasswordAccount/);
  assert.match(rules, /documents\/pendingAccounts\/\$\(uid\)/);
  assert.match(rules, /existsAfter/);
  assert.match(rules, /getAfter/);
});

test("perfil e username são validados e vinculados atomicamente", () => {
  assert.match(rules, /data\.keys\(\)\.hasOnly/);
  assert.match(rules, /username\.matches/);
  assert.match(rules, /existsAfter/);
  assert.match(rules, /getAfter/);
  assert.match(rules, /usernameOwnedAfter/);
  assert.match(rules, /function validProfileTags[\s\S]*tags\.size\(\) <= 6/);
  assert.match(rules, /validProfileTags\(data\.interestTags\)/);
  assert.match(rules, /data\.sport is string[\s\S]*data\.sport\.size\(\) <= 40/);
  assert.equal(rules.includes("data.club.size() == 0 || data.club.size() >= 2"), true);
  assert.match(rules, /oldUsernameReleasedAfter/);
});

test("posts e avatares remotos exigem propriedade e campos permitidos", () => {
  assert.match(rules, /function validPost/);
  assert.match(rules, /match \/tagCatalog\/\{tagKey\}/);
  assert.match(rules, /validPostTags\(data\.tags\)/);
  assert.match(rules, /match \/posts\/\{postId\}/);
  assert.match(rules, /request\.resource\.data\.authorId == request\.auth\.uid/);
  assert.match(rules, /data\.mediaPath == 'posts\/'/);
  assert.match(rules, /data\.durationMs <= 120000/);
  assert.match(rules, /match \/profileMedia\/\{uid\}/);
  assert.match(rules, /allow create, update, delete: if false/);
  assert.match(rules, /authProvider in \['password', 'google'\]/);
});

test("estado social sincronizado preserva privacidade e contadores do servidor", () => {
  assert.match(rules, /match \/postEngagement\/\{playerId\}/);
  assert.match(rules, /match \/userPostLikes\/\{uid\}\/posts\/\{playerId\}/);
  assert.match(rules, /match \/userPostViews\/\{uid\}\/posts\/\{playerId\}/);
  assert.match(rules, /match \/directMessages\/\{messageId\}/);
  assert.match(rules, /resource\.data\.senderUserId == request\.auth\.uid/);
  assert.match(rules, /resource\.data\.recipientUserId == request\.auth\.uid/);
  assert.match(rules, /match \/socialPreferences\/\{uid\}/);
  assert.match(rules, /match \/postComments\/\{commentId\}/);
  assert.match(rules, /resource\.data\.authorUserId == request\.auth\.uid/);
  assert.match(rules, /match \/follows\/\{followId\}/);
  assert.match(rules, /match \/notifications\/\{notificationId\}/);
  assert.match(
    rules,
    /resource\.data\.recipientUserId == request\.auth\.uid/
  );
  assert.match(notificationFunctions, /onDocumentCreated/);
  assert.match(notificationFunctions, /markNotificationsRead/);
  assert.match(rules, /match \/profileMedia\/\{uid\}[\s\S]*allow create, update, delete: if false/);
  assert.match(socialFunctions, /database\.doc\(`profiles\/\$\{recipientUserId\}`\)/);
});
test("IDs visuais do feed sao convertidos para o documento real do post", () => {
  assert.match(socialFunctions, /function getPostDocumentId/);
  assert.equal(
    socialFunctions.includes("database.doc(\`posts/\${sharedPostId}\`)"),
    true
  );
  assert.match(socialService, /postId: getPostDocumentId\(comment\.playerId\)/);
  assert.match(rules, /data\.playerId == 'approved-' \+ data\.postId/);
});
test("assinaturas e identidade são autoritativas no servidor", () => {
  assert.match(rules, /match \/subscriptions\/\{uid\}/);
  assert.match(rules, /match \/identityVerifications\/\{uid\}/);
  assert.match(rules, /allow get: if owns\(uid\)/);
  assert.match(
    rules,
    /match \/subscriptions\/\{uid\}[\s\S]*allow create, update, delete: if false/
  );
  assert.match(
    rules,
    /match \/identityVerifications\/\{uid\}[\s\S]*allow create, update, delete: if false/
  );
  assert.match(mercadoPagoFunctions, /MERCADO_PAGO_ACCESS_TOKEN|mercadoPagoAccessToken/);
  assert.match(mercadoPagoFunctions, /WebhookSignatureValidator\.validate/);
  assert.match(mercadoPagoFunctions, /const PLUS_AMOUNT = 9\.9/);
  assert.match(mercadoPagoFunctions, /transaction_amount: PLUS_AMOUNT/);
  assert.match(mercadoPagoFunctions, /currency_id: PLUS_CURRENCY/);
  assert.match(mercadoPagoFunctions, /externalUid !== uid/);
  assert.match(
    mercadoPagoFunctions,
    /MERCADO_PAGO_TEST_PAYER_EMAIL|mercadoPagoTestPayerEmail/
  );
  assert.match(mercadoPagoFunctions, /environment === "production"/);
  assert.match(mercadoPagoFunctions, /testuser/);
  assert.match(mercadoPagoFunctions, /payerEmailHash === payerEmailHash/);
  assert.match(mercadoPagoFunctions, /identityVerifications\/\$\{uid\}/);
  assert.match(
    mercadoPagoFunctions,
    /status === "authorized" &&[\s\S]*status === "approved"/
  );
  assert.match(
    rules,
    /affectedKeys\(\)\.hasAny\(\['identityVerified', 'plusActive'\]\)/
  );
  assert.match(profileScreen, /window\.location\.assign\(checkout\.checkoutUrl\)/);
  assert.match(mercadoPagoFunctions, /cancelPlusSubscription/);
  assert.match(mercadoPagoFunctions, /body: \{ status: "canceled" \}/);
  assert.match(mercadoPagoFunctions, /updatedUid !== uid/);
  assert.match(profileScreen, /onCancelSubscription/);
  assert.match(appRoutes, /syncProfessionalSubscription/);
});
