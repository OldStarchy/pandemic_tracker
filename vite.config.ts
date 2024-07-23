import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	base: '/pandemic_tracker',
	build: {
		sourcemap: 'hidden',
	},
	plugins: [
		react({
			babel: {
				plugins: [
					'@babel/plugin-proposal-explicit-resource-management',
				],
			},
		}),
	],
});
