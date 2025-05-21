import { useTheme } from "@/app/ThemeContext";

const ThemeSwitcher: React.FC = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="
        p-2 rounded border 
        bg-gray-100 dark:bg-gray-700 
        text-gray-800 dark:text-gray-200 
        hover:bg-gray-200 dark:hover:bg-gray-600
        transition-colors duration-150
      "
			aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
		>
			{theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
		</button>
	);
};

export default ThemeSwitcher;
