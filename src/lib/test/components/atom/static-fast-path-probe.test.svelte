<script lang="ts">
	// L1's static fast path in `kernel.svelte.ts` `element()`: a class-only preset entry with no
	// layer/variantProps/variants resolves through the frozen `staticBase` reference when the
	// consumer passes no class/defaults/variants, and rebuilds through the ordinary merge the
	// moment `defaults` (or any other own/consumer attribute) is present. `presentation.svelte.spec.ts`
	// drives both branches through this probe.
	import { setPreset, defaultPreset } from '$ixirjs/ui/preset';
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';

	// `simpleRecord` (`kernel/resolve/default-record.ts`) only caches a factory that IS
	// `defaultPreset[key]` by reference, so reusing the shipped entry — rather than writing a
	// look-alike factory — is what actually lands this probe on the static classification and not
	// the generic per-resolve branch.
	setPreset({ 'card.header': defaultPreset['card.header'] });

	let { marker = 'a', ...rest }: { marker?: string; [key: string]: unknown } = $props();
</script>

<KernelElement
	as="div"
	preset="card.header"
	defaults={{ 'data-default': 'default' }}
	data-testid="static-part"
	data-marker={marker}
	{...rest}
></KernelElement>
