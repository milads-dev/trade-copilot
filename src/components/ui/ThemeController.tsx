import { useEffect, useState } from "react";

export function ThemeController() {
  const [isDarkMode, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "forest") {
      document.documentElement.setAttribute("data-theme", "forest");
      setIsDark(true);
    } else {
      document.documentElement.setAttribute("data-theme", "emerald");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "emerald" : "forest";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setIsDark(!isDarkMode);
  };

  return (
    <div className="flex w-full items-center justify-between  p-4">
      <p className="mt-3">{isDarkMode ? "Dark Mode" : "Light Mode"}</p>
      <label className="switch">
        <input
          type="checkbox"
          className="cb"
          checked={isDarkMode}
          onChange={toggleTheme}
        />

        <span className="toggle">
          <span className="left">ON</span>
          <span className="right">OFF</span>
        </span>
      </label>
    </div>
  );
}
