export function copy(text: string) {
	return navigator.clipboard.writeText(text);
}

/**
 * Copy-to-clipboard with the "Copied" flash every docs button wants.
 *
 * Seven components had grown their own `copied` + `setTimeout` + reset triple; this is that, once.
 * `key` separates several buttons sharing one copier; `text` may be a promise so a button that
 * fetches its content (a page's Markdown) needs no extra branch.
 */
export function createCopier(resetMs = 1400) {
	// `null`, not `''`: the default key *is* `''`, so an empty-string sentinel would report every
	// single-button copier as already copied on first render.
	let copied = $state<string | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	return {
		async run(text: string | Promise<string>, key = '') {
			try {
				await copy(await text);
				copied = key;
				clearTimeout(timer);
				timer = setTimeout(() => (copied = null), resetMs);
			} catch {
				copied = null;
			}
		},
		label(key = '', idle = 'Copy') {
			return copied === key ? 'Copied' : idle;
		}
	};
}
