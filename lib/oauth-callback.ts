export type OAuthCallbackPayload =
  | { type: "oauth_success"; platform: string; code: string }
  | { type: "oauth_error"; platform: string; error: string };

export const buildOAuthCallbackPayload = (
  platform: string,
  code: string | null,
  error: string | null,
): OAuthCallbackPayload => {
  if (error) {
    return { type: "oauth_error", platform, error };
  }

  if (!code) {
    return {
      type: "oauth_error",
      platform,
      error: "The authorization provider did not return a connection code.",
    };
  }

  return { type: "oauth_success", platform, code };
};
