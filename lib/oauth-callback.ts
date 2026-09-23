export type OAuthCallbackPayload =
  | { type: "oauth_success"; platform: string; code?: string }
  | { type: "oauth_error"; platform: string; error: string };

export const buildOAuthCallbackPayload = (
  platform: string,
  code: string | null,
  error: string | null,
  completed: boolean | null = null,
): OAuthCallbackPayload => {
  if (error) {
    return { type: "oauth_error", platform, error };
  }

  if (completed === false) {
    return {
      type: "oauth_error",
      platform,
      error: "The connection was not completed. Please try again.",
    };
  }

  // Newer backend callbacks exchange and persist the provider code before
  // redirecting to this page. In that flow the callback intentionally has no
  // code to relay; the opener verifies the saved connection by reloading it.
  return code
    ? { type: "oauth_success", platform, code }
    : { type: "oauth_success", platform };
};

/**
 * Normalize callback parameters used by both the current backend flow and
 * older provider integrations. Meta commonly returns `error_description`,
 * while older Growdex callbacks used `auth_code` and `success=false`.
 */
export const readOAuthCallbackPayload = (
  platform: string,
  searchParams: Pick<URLSearchParams, "get">,
): OAuthCallbackPayload => {
  const code = searchParams.get("code") || searchParams.get("auth_code");
  const error =
    searchParams.get("error_description") ||
    searchParams.get("error_message") ||
    searchParams.get("message") ||
    searchParams.get("error");
  const success = searchParams.get("success");

  return buildOAuthCallbackPayload(
    platform,
    code,
    error,
    success === null ? null : success.toLowerCase() !== "false",
  );
};
