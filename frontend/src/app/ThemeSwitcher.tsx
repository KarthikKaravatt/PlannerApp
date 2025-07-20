import { useTheme } from "@/contexts/themeContext";

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className=" rounded p-2 transition-colors duration-150 "
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "🌙 " : "☀️"}
    </button>
  );
};
