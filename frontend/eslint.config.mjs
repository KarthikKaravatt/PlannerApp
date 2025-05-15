// @ts-check

import eslintReact from "@eslint-react/eslint-plugin";
import eslintJs from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config({
	files: ["**/*.ts", "**/*.tsx"],
	extends: [
		eslintJs.configs.recommended,
		tseslint.configs.strictTypeChecked,
		tseslint.configs.stylisticTypeChecked,
		eslintReact.configs["recommended-type-checked"],
		reactHooks.configs["recommended-latest"],
	],
	languageOptions: {
		parser: tseslint.parser,
		parserOptions: {
			projectService: true,
			tsconfigRootDir: import.meta.dirname,
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	rules: {},
});
