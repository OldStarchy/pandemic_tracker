import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
	{
		ignores: ['eslint.config.mjs'],
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
	},
	{ languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReactConfig,
	pluginReactHooks.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				project: 'tsconfig.json',
			},
		},
		rules: {
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/no-confusing-void-expression': [
				'error',
				{
					ignoreVoidOperator: true,
				},
			],
			'react/react-in-jsx-scope': 'off',
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
];
