<script lang="ts">
	import { resolveControlPreset } from './shared';
	import SegmentedField from './segmented-field.svelte';
	import { InputBond } from './bond.svelte';
	import type { InputEmailControlProps } from './types';

	const bond = InputBond.get();

	let {
		class: klass = '',
		value = $bindable(''),
		placeholder = 'you@example.com',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.email',
		onchange = undefined,
		oninput = undefined,
		...restProps
	}: InputEmailControlProps = $props();

	const preset = resolveControlPreset(() => presetKey, bond);

	// Parse email into segments
	type Segment = { text: string; kind: 'local' | 'at' | 'domain' | 'tld' | 'plain' };

	function parseSegments(raw: string): Segment[] {
		if (!raw) return [];

		const atIdx = raw.indexOf('@');
		if (atIdx === -1) return [{ text: raw, kind: 'plain' }];

		const local = raw.slice(0, atIdx);
		const domain = raw.slice(atIdx + 1);
		const segs: Segment[] = [];

		if (local) segs.push({ text: local, kind: 'local' });
		segs.push({ text: '@', kind: 'at' });

		if (domain) {
			// Split domain into base + TLD on the last dot.
			const lastDot = domain.lastIndexOf('.');
			if (lastDot !== -1 && lastDot < domain.length - 1) {
				segs.push({ text: domain.slice(0, lastDot), kind: 'domain' });
				segs.push({ text: domain.slice(lastDot), kind: 'tld' });
			} else {
				segs.push({ text: domain, kind: 'domain' });
			}
		}

		return segs;
	}

	const segments = $derived(parseSegments(value));

	const kindStyle: Record<Segment['kind'], string> = {
		local: 'color: var(--input-hl-primary, var(--foreground)); font-weight: 500',
		at: 'color: var(--input-hl-muted, var(--foreground))',
		domain: 'color: var(--input-hl-secondary, var(--foreground))',
		tld: 'color: var(--input-hl-accent, var(--foreground))',
		plain: 'color: var(--foreground)'
	};
</script>

<SegmentedField
	type="email"
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
	{...restProps}
/>
