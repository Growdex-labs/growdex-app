export type OAuthCallbackPayload =
  | { type: "oauth_success"; platform: string; code?: string }
  | { type: "oauth_error"; platform: string; error: string };

export const buildOAuthCallbackPayload = (
  platform: string,
  code: string | null,
  error: string | null,
): OAuthCallbackPayload => {
  if (error) {
    return { type: "oauth_error", platform, error };
  }

  // Newer backend callbacks exchange and persist the provider code before
  // redirecting to this page. In that flow the callback intentionally has no
  // code to relay; the opener verifies the saved connection by reloading it.
  return code
    ? { type: "oauth_success", platform, code }
    : { type: "oauth_success", platform };
};
