// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'dist/**',
			'storybook-static/**',
			'test-results/**',
			'src/routes/**/llms.txt/**',
			'**/llms.txt/**'
		]
	},
	{
		linterOptions: {
			reportUnusedDisableDirectives: false
		}
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			// Honor the `_`-prefix convention for intentionally-unused args/vars/caught errors
			// (e.g. `(_ , value) => …`, `_index`), so deliberate placeholders aren't flagged.
			// `ignoreRestSiblings` allows the idiomatic Svelte `$props()` swallow pattern — a prop
			// destructured alongside `...restProps` to exclude it from the rest spread (e.g. `children`).
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			],
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-useless-children-snippet': 'off',
			'svelte/no-useless-mustaches': 'off',
			'svelte/prefer-svelte-reactivity': 'off'
		}
	},
	{
		files: ['src/docs/**/*', 'src/routes/docs/**/*'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'svelte/no-at-html-tags': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	storybook.configs['flat/recommended']
);
