import { useEffect } from "react";

const APP_NAME = "AYS";

/**
 * Sets the browser tab title for the current page.
 * Format: "{title} | AYS"
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
};
