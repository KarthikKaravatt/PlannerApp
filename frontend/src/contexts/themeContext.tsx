import {
	type ReactNode,
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const defaultThemeContextValue: ThemeContextType = {
	theme: "light",
	toggleTheme: () => {
		console.warn("toggleTheme called outside of ThemeProvider");
	},
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContextValue);

const THEME_STORAGE_KEY = "app-theme";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window === "undefined") {
			return "light";
		}
		const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
		if (storedTheme === "light" || storedTheme === "dark") {
			return storedTheme;
		}
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	});

	useEffect(() => {
		if (typeof window !== "undefined") {
			const root = window.document.documentElement;
			if (theme === "dark") {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		}
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	}, []);

	const contextValue = useMemo(
		() => ({
			theme,
			toggleTheme,
		}),
		[theme, toggleTheme],
	);

	return <ThemeContext value={contextValue}>{children}</ThemeContext>;
};

export const useTheme = (): ThemeContextType => {
	const context = use(ThemeContext);
	if (context === defaultThemeContextValue && typeof window !== "undefined") {
		console.warn(
			"useTheme is used outside of a ThemeProvider or the provider is not yet mounted.",
		);
	}
	return context;
};
