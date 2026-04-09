import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	base: process.env.VITE_BASE_URL || '/',
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
