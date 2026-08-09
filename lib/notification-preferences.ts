import { apiFetch } from "./auth";

export interface NotificationPreferences {
  campaignUpdates: boolean;
  performanceAlerts: boolean;
  aiRecommendations: boolean;
  productUpdates: boolean;
}

export const NOTIFICATION_PREFERENCE_KEYS = [
  "campaignUpdates",
  "performanceAlerts",
  "aiRecommendations",
  "productUpdates",
] as const satisfies ReadonlyArray<keyof NotificationPreferences>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  campaignUpdates: true,
  performanceAlerts: true,
  aiRecommendations: true,
  productUpdates: true,
};

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Notification settings were not valid JSON.");
  }
};

const unwrap = (value: unknown): unknown =>
  value && typeof value === "object" && "data" in value
    ? (value as { data?: unknown }).data
    : value;

export const parseNotificationPreferences = (
  value: unknown,
): NotificationPreferences => {
  if (!value || typeof value !== "object") {
    throw new Error("Notification settings returned an invalid response.");
  }

  const preferences = value as Partial<NotificationPreferences>;
  if (
    NOTIFICATION_PREFERENCE_KEYS.some(
      (key) => typeof preferences[key] !== "boolean",
    )
  ) {
    throw new Error("Notification settings returned an invalid response shape.");
  }

  return preferences as NotificationPreferences;
};

const failureMessage = (body: unknown, fallback: string) =>
  body && typeof body === "object" && "message" in body
    ? String((body as { message: unknown }).message)
    : fallback;

export const fetchNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    const response = await apiFetch("/users/notification-preferences", {
      method: "GET",
    });
    const body = await readJson(response);
    if (!response.ok) {
      throw new Error(
        failureMessage(
          body,
          `Notification settings failed to load (${response.status}).`,
        ),
      );
    }
    return parseNotificationPreferences(unwrap(body));
  };

export const updateNotificationPreferences = async (
  preferences: NotificationPreferences,
): Promise<void> => {
  const response = await apiFetch("/users/notification-preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });
  if (!response.ok) {
    const body = await readJson(response);
    throw new Error(
      failureMessage(
        body,
        `Notification settings could not be saved (${response.status}).`,
      ),
    );
  }
};
