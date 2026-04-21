import { useEffect, useState } from "react";

export function ThemeController() {
  const [isDarkMode, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setIsDark(currentTheme === "forest");
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "emerald" : "forest";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setIsDark(!isDarkMode);
  };

  if (isDarkMode === null)
    return <div className="p-4 h-[72px]">Loading...</div>;

  return (
    <div className="flex justify-between items-center p-4 w-full">
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
