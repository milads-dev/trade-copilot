import { useEffect, useState } from "react";

export const useThemeObserver = () => {
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      if (theme) setCurrentTheme(theme);
    };

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    updateTheme();

    return () => observer.disconnect();
  }, []);

  return currentTheme;
};
