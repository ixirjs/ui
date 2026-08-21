<script lang="ts">
	import type { BundledLanguage, BundledTheme } from 'shiki';
	import { Theme } from '../../routes/theme.svelte';

	type Props = {
		code: string;
		lang?: string;
		theme?: string;
		class?: string;
		showLineNumbers?: boolean;
		showLeftBorder?: boolean;
		transparent?: boolean;
	};

	let {
		code,
		lang = 'typescript',
		theme,
		class: className = '',
		showLineNumbers = false,
		showLeftBorder = true,
		transparent = true
	}: Props = $props();

	// The llms.txt endpoints render docs standalone — no +layout runs, so no Theme context
	// exists and `Theme.get()` throws. Highlighting theme is irrelevant to that text output.
	let appTheme: Theme | undefined;
	try {
		appTheme = Theme.get();
	} catch {
		appTheme = undefined;
	}

	let isDark = $derived(appTheme ? appTheme.colorScheme === 'dark' : true);
	let highlightedCode = $state('');
	let isLoading = $state(true);

	function normalizeLang(value: string): BundledLanguage {
		const normalized = value.trim().toLowerCase();

		switch (normalized) {
			case 'ts':
			case 'typescript':
				return 'typescript';
			case 'js':
			case 'javascript':
				return 'javascript';
			case 'sh':
			case 'shell':
			case 'bash':
				return 'bash';
			case 'markup':
			case 'xml':
			case 'html':
				return 'html';
			default:
				return normalized as BundledLanguage;
		}
	}

	// Languages to always pre-load so they're available in the browser bundle
	const BASE_LANGS: BundledLanguage[] = ['typescript', 'svelte', 'bash', 'json', 'html', 'css'];

	$effect(() => {
		const resolvedTheme = (theme ?? (isDark ? 'github-dark' : 'vitesse-light')) as BundledTheme;
		const resolvedLang = normalizeLang(lang);
		let alive = true;
		isLoading = true;

		// Merge requested lang into pre-loaded set
		const langs = BASE_LANGS.includes(resolvedLang)
			? BASE_LANGS
			: ([...BASE_LANGS, resolvedLang] as BundledLanguage[]);

		import('shiki')
			.then(({ createHighlighter }) =>
				createHighlighter({
					themes: [resolvedTheme],
					langs
				})
			)
			.then((highlighter) => {
				if (!alive) return '';
				return highlighter.codeToHtml(code, {
					lang: resolvedLang,
					theme: resolvedTheme,
					transformers: showLineNumbers
						? [
								{
									name: 'line-numbers',
									line(node, line) {
										node.properties['data-line'] = line;
									}
								}
							]
						: []
				});
			})
			.then((html) => {
				if (!alive) return;
				highlightedCode = html;
				isLoading = false;
			})
			.catch((err) => {
				if (!alive) return;
				console.error('Syntax highlighting error:', err);
				highlightedCode = `<pre><code>${code}</code></pre>`;
				isLoading = false;
			});

		return () => {
			alive = false;
		};
	});
</script>

<div
	class="code-block {transparent ? 'transparent' : ''} {className}"
	style:--left-border-width={showLeftBorder ? '1px' : '0px'}
>
	{#if isLoading}
		<div class="bg-code-bg animate-pulse p-3.5">
			<div class="bg-muted-foreground/20 h-3 w-3/4 rounded"></div>
			<div class="bg-muted-foreground/20 mt-2 h-3 w-1/2 rounded"></div>
		</div>
	{:else}
		<div class="overflow-x-auto">
			{@html highlightedCode}
		</div>
	{/if}
</div>

<style>
	.code-block :global(pre) {
		/* 14px / 12.5px / 1.7 — the design's code metrics. */
		padding: 14px;
		overflow-x: auto;
		border-radius: 0;
		border-left: var(--left-border-width, 0px) solid
			color-mix(in oklch, currentColor 15%, transparent);
		background: transparent !important;
		margin: 0;
	}

	.code-block :global(code) {
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.7;
	}

	.code-block :global([data-line]) {
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}

	.code-block :global([data-line]::before) {
		content: attr(data-line);
		display: inline-block;
		width: 2rem;
		margin-right: 1rem;
		text-align: right;
		opacity: 0.4;
	}
</style>
