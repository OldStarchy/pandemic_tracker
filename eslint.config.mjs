import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import pluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default tseslint.config(
	{
		files: ['**/*.ts', '**/*.tsx'],
		ignores: ['**/dist', 'eslint.config.mjs', 'vite.config.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: ['./tsconfig.app.json'],
			},
			globals: {
				...globals.browser,
				...globals.es2024,
			},
		},
		extends: tseslint.configs.recommendedTypeChecked,
	},
	eslint.configs.recommended,
	{
		plugins: { prettier: pluginPrettier },
		.../** @type {import('typescript-eslint').ConfigWithExtends} */ (
			configPrettier
		),
	},
	{
		plugins: { 'react-hooks': reactHooks },
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},
	{
		plugins: {
			'react-refresh': reactRefresh,
		},

		rules: {
			'react-refresh/only-export-components': [
				'warn',
				{
					allowConstantExport: true,
				},
			],
		},
	},
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
);
