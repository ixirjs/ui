<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { DialogBond } from './bond.svelte';
	const PART = Kernel.part(DialogBond, 'closeButton', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'button', B extends Base = Base">
	import { Icon } from '$ixirjs/ui/components/icon';
	import Close from '$ixirjs/ui/icons/icon-close.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { DialogCloseButtonProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'button' as E,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: DialogCloseButtonProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), {
		context: 'required',
		message: '<Dialog.Close /> must be used within a <Dialog.Root />'
	});
	const bond = part.bond;
	const defaults = $derived({
		type: as === 'button' ? 'button' : undefined,
		role: as === 'button' ? undefined : 'button',
		tabindex: as === 'button' ? undefined : 0
	});

	// These run before the atom's own close handler and stage the reason for it. The seam composes
	// the two — consumer handler first, then the atom's, skipped when default is prevented — so
	// neither needs to invoke the atom handler by hand.
	function onclick_(event: MouseEvent) {
		onclick?.(event);
		if (event.defaultPrevented) return;

		bond.stageOpenChange({ event, reason: 'close-button' });
	}

	function onkeydown_(event: KeyboardEvent) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;

		if (event.key === 'Enter' || event.key === ' ') {
			bond.stageOpenChange({ event, reason: 'close-button' });
		}
	}

	const el = Kernel.element(part, () => ({
		as,
		class: ['cursor-pointer', '$preset', klass],
		defaults,
		...restProps,
		onclick: onclick_,
		onkeydown: onkeydown_
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), body, undefined, el.motion(), el)}

{#snippet body()}
	{@render (children ?? fallback)({ dialog: bond })}
{/snippet}

{#snippet fallback()}
	<Icon>
		<Close />
	</Icon>
{/snippet}
