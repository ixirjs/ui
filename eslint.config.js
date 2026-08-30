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
			// Agent scratch: parallel migration worktrees, each with its own `.svelte-kit` output.
			'.claude/**',
			'build/**',
			'dist/**',
			'storybook-static/**',
			'test-results/**',
			'src/routes/**/llms.txt/**',
			'**/llms.txt/**',
			// Vendored shadcn-svelte source — see bench/vs-shadcn/provenance.json. Linting someone
			// else's code is noise, and any fix would be undone by the next fetch.
			'bench/vs-shadcn/shadcn/**'
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
		files: [
			'src/lib/components/**/*',
			'src/lib/authoring/**/*',
			'src/lib/kernel/**/*',
			'src/lib/bond/**/*',
			'src/lib/capability/**/*',
			'src/lib/validation/**/*',
			'src/lib/shared/**/*',
			'src/lib/preset/**/*'
		],
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
		// One seam and two barrels for family code.
		//
		// `Kernel` was once reached by 151 deep imports and `definePart` by 35, neither exported from
		// any barrel — so "import the seam, not the machinery" was prose, and prose is what let five
		// different ways to write one part accumulate. The seam is now one file every family imports
		// by name, and this rule is what keeps the machinery behind it.
		//
		// The layer barrels stay reachable: `$ixirjs/ui/capability` is where behaviour models live,
		// `$ixirjs/ui/authoring` carries the prop types and motion, and `$ixirjs/ui/preset` is a peer.
		// What is blocked is reaching *inside* a layer.
		files: ['src/lib/components/**/*'],
		ignores: [
			// Render machinery that happens to live under components/. See the same list, and the
			// reasoning, in `src/lib/test/contracts/kernel-authoring-audit.spec.ts`.
			'src/lib/components/element/html-element.svelte',
			'src/lib/components/element/svg-element.svelte',
			'src/lib/components/input/shared.ts',
			'src/lib/components/popover/bond.svelte.ts',
			'src/lib/components/slider/slider.svelte',
			'src/lib/components/switch/switch.svelte',
			'src/lib/components/textarea/textarea-input.svelte'
		],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@ixirjs/ui', '@ixirjs/ui/*'],
							message:
								"Import library internals through the '$ixirjs/ui/…' alias. '@ixirjs/ui/…' is the published barrel (src/lib/public), and product code must not author itself through its own public surface."
						},
						{
							group: [
								'$ixirjs/ui/authoring/*',
								// Everything under kernel/ EXCEPT `kernel/kernel.svelte`, the element seam every
								// family authors through (kernel-authoring-audit.spec.ts). Listed by file, not as
								// the directory: a directory pattern excludes its whole subtree and a negation
								// cannot re-include beneath it.
								'$ixirjs/ui/kernel/element.svelte',
								'$ixirjs/ui/kernel/element-render.svelte',
								'$ixirjs/ui/kernel/presentation.svelte',
								'$ixirjs/ui/kernel/merge',
								'$ixirjs/ui/kernel/snippet.svelte',
								'$ixirjs/ui/kernel/types',
								'$ixirjs/ui/kernel/render/*',
								'$ixirjs/ui/kernel/resolve/*'
							],
							message:
								"Author parts through '$ixirjs/ui/kernel/kernel.svelte' (Kernel.element/render/context/id/claimId) and take prop types, identity helpers and motion from '$ixirjs/ui/authoring'. Behaviour models come from '$ixirjs/ui/capability'. Reaching inside a layer is what the barrels exist to replace."
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
