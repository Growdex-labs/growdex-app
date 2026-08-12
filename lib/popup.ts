interface PopupSize {
  width: number;
  height: number;
}

const DEFAULT_SIZE: PopupSize = { width: 1024, height: 768 };

/**
 * Open a URL in a centered popup window and return it, or null when the
 * browser blocks it.
 *
 * The popup keeps its address bar, so someone entering payment details can see
 * whose site they are on. It also loses its reference back to this window,
 * which stops the opened page from steering the tab behind it.
 */
export const openPopupWindow = (
  url: string,
  name: string,
  size: PopupSize = DEFAULT_SIZE,
): Window | null => {
  const width = Math.min(size.width, window.outerWidth || size.width);
  const height = Math.min(size.height, window.outerHeight || size.height);
  const left = window.screenX + ((window.outerWidth || width) - width) / 2;
  const top = window.screenY + ((window.outerHeight || height) - height) / 2;

  const popup = window.open(
    url,
    name,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=yes,status=no,menubar=no,scrollbars=yes,resizable=yes`,
  );

  if (!popup) return null;

  try {
    popup.opener = null;
    popup.focus();
  } catch {
    // A cross-origin popup can refuse both. Neither is worth failing over.
  }

  return popup;
};
