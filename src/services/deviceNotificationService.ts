import { BRAND } from "../config/brand.ts";
import { Platform } from "react-native";
import type { AppNotification } from "../types";
import { getNotificationText } from "../utils/notifications";

export type DeviceNotificationPermission =
  | "default"
  | "denied"
  | "granted"
  | "unsupported";

function getNotificationApi() {
  if (
    Platform.OS !== "web" ||
    typeof globalThis === "undefined" ||
    !("Notification" in globalThis)
  ) {
    return null;
  }

  return globalThis.Notification;
}

export function getDeviceNotificationPermission(): DeviceNotificationPermission {
  return getNotificationApi()?.permission ?? "unsupported";
}

export async function requestDeviceNotificationPermission(): Promise<DeviceNotificationPermission> {
  const notificationApi = getNotificationApi();

  if (!notificationApi) {
    return "unsupported";
  }
  if (notificationApi.permission !== "default") {
    return notificationApi.permission;
  }

  return notificationApi.requestPermission();
}

export async function showDeviceNotification(notification: AppNotification) {
  const notificationApi = getNotificationApi();

  if (!notificationApi || notificationApi.permission !== "granted") {
    return false;
  }

  const options: NotificationOptions = {
    body: getNotificationText(notification),
    icon: "/favicon.ico",
    tag: "xolot-" + notification.id
  };

  try {
    const popup = new notificationApi(BRAND.name, options);

    popup.onclick = () => {
      if (typeof window !== "undefined") {
        window.focus();
      }
      popup.close();
    };
    return true;
  } catch {
    if (
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(BRAND.name, options);
      return true;
    } catch {
      return false;
    }
  }
}