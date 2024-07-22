import { defineConfig } from 'vite';
import postcssPresetEnv from 'postcss-preset-env';
import stylelint from 'vite-plugin-stylelint';
import svgLoader from 'vite-svg-loader';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [
		vue(),
		svgLoader({
			svgoConfig: {
				floatPrecision: 2,
				multipass: true,
			},
		}),
		stylelint({
			files: ['src/**/*.{vue,css}'],
		}),
	],
	css: {
		postcss: {
			plugins: [
				postcssPresetEnv({
					features: {
						'nesting-rules': true,
					},
				}),
			],
		},
	},
});
