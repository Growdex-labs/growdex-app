interface ApiErrorBody {
  message?: unknown;
  errors?: Array<{ message?: unknown; field?: unknown; path?: unknown }>;
}

const fieldName = (entry: { field?: unknown; path?: unknown }) => {
  if (typeof entry.field === "string" && entry.field) return entry.field;
  if (Array.isArray(entry.path)) {
    return entry.path
      .filter(
        (part): part is string | number =>
          typeof part === "string" || typeof part === "number",
      )
      .join(".");
  }
  return "";
};

/**
 * Turn an API error body into a sentence worth showing someone.
 *
 * Validation failures arrive as a list of field errors beside a generic
 * "Validation failed" headline, so the list is the part that explains what to
 * correct.
 */
export const readApiErrorMessage = (data: unknown, fallback: string) => {
  if (!data || typeof data !== "object") return fallback;
  const body = data as ApiErrorBody;

  const details = (body.errors ?? [])
    .map((entry) => {
      if (typeof entry?.message !== "string" || !entry.message.trim()) return "";
      const field = fieldName(entry);
      return field ? `${field}: ${entry.message}` : entry.message;
    })
    .filter(Boolean);
  if (details.length) return details.join(", ");

  if (Array.isArray(body.message)) {
    const messages = body.message.filter(
      (entry): entry is string => typeof entry === "string" && !!entry.trim(),
    );
    if (messages.length) return messages.join(", ");
  }

  return typeof body.message === "string" && body.message.trim()
    ? body.message
    : fallback;
};

/** Read an error message from a failed response, whatever its body contains. */
export const readResponseError = async (
  response: Response,
  fallback: string,
) => {
  const body = await response.json().catch(() => null);
  return readApiErrorMessage(body, fallback);
};
