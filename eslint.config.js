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
			// An empty interface is this library's declaration-merging seam (ADR 0008), in both its
			// shapes: `interface CardTitleProps extends HtmlAtomProps<E, B> {}` for interface-shaped
			// props, and a bare `interface TreeRootExtendProps {}` for the ones a type alias cannot
			// merge into. An empty body is the point, not an oversight, so the rule is wrong here
			// rather than the code — it was being silenced 61 times by hand. Object types stay
			// checked: `type X = {}` is still an error (see the three in `components/atom/types.ts`).
			'@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/no-useless-children-snippet': 'off',
			'svelte/no-useless-mustaches': 'off',
			'svelte/prefer-svelte-reactivity': 'off'
		}
	},
	{
		// `@ixirjs/ui/*` resolves to `src/lib/public/*` — the hand-curated published surface — while
		// `$ixirjs/ui/*` resolves to `src/lib/*`. Both work, so four families (collapsible, combobox,
		// datagrid, select) had drifted onto the package specifier and were authoring themselves
		// through their own published barrel, which is a strict subset: `lazyCapability` and
		// `isBrowser` were only reachable that way. Collapsible is the exemplar AGENTS.md says to
		// copy for a bonded family, so the minority convention was the one being taught.
		//
		// Product code takes the internal alias. `src/lib/public/**` is the barrel itself and
		// `src/lib/test/**` legitimately imports the public surface — that is what it is testing.
		files: ['src/lib/components/**/*', 'src/lib/shared/**/*', 'src/lib/preset/**/*'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@ixirjs/ui', '@ixirjs/ui/*'],
							message:
								"Import library internals through the '$ixirjs/ui/…' alias. '@ixirjs/ui/…' is the published barrel (src/lib/public), and product code must not author itself through its own public surface."
						}
					]
				}
			]
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
