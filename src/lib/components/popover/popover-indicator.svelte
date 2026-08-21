<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { PopoverBond } from './bond.svelte';
	const PART = Kernel.plan(PopoverBond, 'indicator', { class: '' });
</script>

<script lang="ts">
	import { animate } from '$ixirjs/ui/shared';
	import { Icon } from '$ixirjs/ui/components/icon';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import type { PresetKey } from '$ixirjs/ui/preset';
	import { overlayIsOpen } from '$ixirjs/ui/components/overlay/policies/overlay-view';

	let {
		class: klass = '',
		preset = undefined as PresetKey | undefined,
		children = undefined
	} = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const el = Kernel.element(part, () => ({
		class: ['border-border flex h-5 items-center justify-center', '$preset', klass]
	}));

	const isOpen = $derived(overlayIsOpen(part.bond));
</script>

{@render Kernel.render(el)(el, children ?? fallback, { popover: part.bond })}

{#snippet fallback()}
	<Icon
		class="h-full"
		src={IconArrowDown}
		animate={(node) => animate(node, { rotate: 180 * +isOpen }, { duration: 0.2 })}
	/>
{/snippet}
