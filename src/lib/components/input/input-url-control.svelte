<script lang="ts">
	import { resolveControlPreset } from './shared';
	import SegmentedField from './segmented-field.svelte';
	import { InputBond } from './bond.svelte';
	import type { InputUrlControlProps } from './types';

	const bond = InputBond.get();

	let {
		class: klass = '',
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.url',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputUrlControlProps = $props();

	const preset = resolveControlPreset(
		() => presetKey,
		bond,
		() => restProps
	);

	// Parse URL into segments
	type Segment = {
		text: string;
		kind: 'protocol' | 'host' | 'port' | 'pathname' | 'search' | 'hash' | 'plain';
	};

	function parseSegments(raw: string): Segment[] {
		if (!raw) return [];

		// No protocol? prepend a fake one so URL() parses it.
		const hasProtocol = /^[a-z][a-z0-9+\-.]*:\/\//i.test(raw);
		const forParsing = hasProtocol ? raw : 'https://' + raw;

		try {
			const u = new URL(forParsing);
			const segs: Segment[] = [];

			if (hasProtocol) {
				segs.push({ text: u.protocol + '//', kind: 'protocol' });
			}

			if (u.username) {
				segs.push({ text: u.username + (u.password ? ':' + u.password : '') + '@', kind: 'plain' });
			}

			segs.push({ text: u.hostname, kind: 'host' });

			if (u.port) {
				segs.push({ text: ':' + u.port, kind: 'port' });
			}

			if (u.pathname && u.pathname !== '/') {
				segs.push({ text: u.pathname, kind: 'pathname' });
			} else if (u.pathname === '/' && (u.search || u.hash)) {
				segs.push({ text: '/', kind: 'pathname' });
			}

			if (u.search) {
				segs.push({ text: u.search, kind: 'search' });
			}

			if (u.hash) {
				segs.push({ text: u.hash, kind: 'hash' });
			}

			return segs;
		} catch {
			// Not yet a valid URL — fall back to partial segment detection.
			return partialSegments(raw);
		}
	}

	function partialSegments(raw: string): Segment[] {
		const segs: Segment[] = [];
		let rest = raw;

		const protoMatch = rest.match(/^([a-z][a-z0-9+\-.]*:\/\/)/i);
		if (protoMatch) {
			// Group 1 is required by the regex, so it's present when protoMatch matched.
			segs.push({ text: protoMatch[1]!, kind: 'protocol' });
			rest = rest.slice(protoMatch[1]!.length);
		}

		if (!rest) return segs;

		// Split host from the rest at the first / ? or #
		const sep = rest.search(/[/?#]/);
		if (sep === -1) {
			segs.push({ text: rest, kind: 'host' });
			return segs;
		}

		const hostPart = rest.slice(0, sep);
		const afterHost = rest.slice(sep);

		const portMatch = hostPart.match(/^(.*):(\d+)$/);
		if (portMatch) {
			if (portMatch[1]) segs.push({ text: portMatch[1], kind: 'host' });
			segs.push({ text: ':' + portMatch[2], kind: 'port' });
		} else {
			if (hostPart) segs.push({ text: hostPart, kind: 'host' });
		}

		const hashIdx = afterHost.indexOf('#');
		const searchIdx = afterHost.indexOf('?');

		if (searchIdx !== -1) {
			const path = afterHost.slice(0, searchIdx);
			const queryAndHash = afterHost.slice(searchIdx);
			const hashInQuery = queryAndHash.indexOf('#');
			if (path) segs.push({ text: path, kind: 'pathname' });
			if (hashInQuery !== -1) {
				segs.push({ text: queryAndHash.slice(0, hashInQuery), kind: 'search' });
				segs.push({ text: queryAndHash.slice(hashInQuery), kind: 'hash' });
			} else {
				segs.push({ text: queryAndHash, kind: 'search' });
			}
		} else if (hashIdx !== -1) {
			const path = afterHost.slice(0, hashIdx);
			if (path) segs.push({ text: path, kind: 'pathname' });
			segs.push({ text: afterHost.slice(hashIdx), kind: 'hash' });
		} else {
			segs.push({ text: afterHost, kind: 'pathname' });
		}

		return segs;
	}

	const segments = $derived(parseSegments(value));

	const kindStyle: Record<Segment['kind'], string> = {
		protocol: 'color: var(--input-hl-muted, var(--foreground))',
		host: 'color: var(--input-hl-primary, var(--foreground)); font-weight: 500',
		port: 'color: var(--input-hl-warning, var(--foreground))',
		pathname: 'color: var(--input-hl-secondary, var(--foreground))',
		search: 'color: var(--input-hl-info, var(--foreground))',
		hash: 'color: var(--input-hl-accent, var(--foreground))',
		plain: 'color: var(--input-hl-muted, var(--foreground))'
	};
</script>

<!--
  Two layers: transparent-text <input> on top (caret, selection, native editing)
  over a coloured overlay <span>. Shared markup/scroll-sync lives in <SegmentedField>.
-->
<SegmentedField
	type="text"
	bind:value
	{segments}
	{kindStyle}
	{placeholder}
	{disabled}
	{readonly}
	class={klass}
	{preset}
	{bond}
	{onchange}
	{oninput}
	{onvaluechange}
	{...restProps}
/>
