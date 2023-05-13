// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import("eslint").Linter.Config} */
const config = {
	overrides: [
		{
			extends: [
				"plugin:@typescript-eslint/recommended-requiring-type-checking",
			],
			files: ["*.ts", "*.tsx"],
			parserOptions: {
				project: path.join(__dirname, "tsconfig.json"),
			},
		},
	],
	env: {
		"browser": true,
		"es2020": true,
		"jest": true,
		"node": true
	},
	settings: {
		"react": {
			"version": "detect"
		}
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: path.join(__dirname, "tsconfig.json"),
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 11,
		sourceType: "module"
	},
	plugins: [
		"@typescript-eslint",
		"react",
		"react-hooks"
	],
	extends: [
		"next/core-web-vitals",
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended",
		"plugin:@next/next/recommended"
	],
	rules: {
		"@typescript-eslint/consistent-type-imports": [
			"warn",
			{
				prefer: "type-imports",
				fixStyle: "inline-type-imports",
			},
		],
		"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"react/prop-types": "off",
		"react/react-in-jsx-scope": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-empty-function": "off"
	},
};

module.exports = config;
