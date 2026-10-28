import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import config from './kit.config.js';
export default defineConfig({ plugins: [sveltekit(config)] });
