import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const deviceNotificationService = readFileSync(
  new URL("../src/services/deviceNotificationService.ts", import.meta.url),
  "utf8"
);
const feedScreen = readFileSync(
  new URL("../src/screens/FeedScreen.tsx", import.meta.url),
  "utf8"
);
const profileScreen = readFileSync(
  new URL("../src/screens/ProfileScreen.tsx", import.meta.url),
  "utf8"
);
const socialActions = readFileSync(
  new URL("../src/actions/useSocialActions.ts", import.meta.url),
  "utf8"
);

test("o interruptor controla pop-ups sem ocultar a central interna", () => {
  assert.match(profileScreen, /Notifica\u00e7\u00f5es do dispositivo/);
  assert.match(profileScreen, /pop-ups no celular ou computador/);
  assert.match(feedScreen, /notifications={notifications}/);
  assert.doesNotMatch(feedScreen, /visibleNotifications/);
});

test("pop-ups pedem permissão e mostram somente eventos novos", () => {
  assert.match(deviceNotificationService, /Notification/);
  assert.match(deviceNotificationService, /requestPermission/);
  assert.match(deviceNotificationService, /serviceWorker/);
  assert.match(deviceNotificationService, /showNotification/);
  assert.equal(deviceNotificationService.includes('new notificationApi(BRAND.name'), true);
  assert.match(socialActions, /notificationSessionStartedAtRef/);
  assert.match(socialActions, /createdAt >= sessionStartedAt/);
  assert.match(socialActions, /\.forEach\(showDeviceNotification\)/);
});

test("permissão negada mantém os pop-ups desativados", () => {
  assert.match(socialActions, /permission !== "granted"/);
  assert.match(
    socialActions,
    /syncSocialPreferences\(\{ notificationsEnabled: false \}\)/
  );
});