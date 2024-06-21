import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

export default [
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
	},
	{ languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReactConfig,
	{
		languageOptions: {
			parserOptions: {
				project: 'tsconfig.json',
			},
		},
		rules: {
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/no-confusing-void-expression': 'error',
			'react/react-in-jsx-scope': 'off',
		},
	},
];
