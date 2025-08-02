import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "@/contexts/themeContext";

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className=" rounded p-2 text-blue-950 transition-colors duration-150 dark:text-white"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <IoMoonOutline /> : <IoSunnyOutline />}
    </button>
  );
};
