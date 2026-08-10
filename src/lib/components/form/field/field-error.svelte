<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { FieldBond } from './bond.svelte';
	const PART = Kernel.part(FieldBond, 'error', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'p', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { FieldErrorProps } from '$ixirjs/ui/components/form/types';

	let {
		class: klass = '',
		as = 'p',
		preset = undefined,
		children = undefined,
		...restProps
	}: FieldErrorProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const bond = part.bond;
	// Rendering nothing while the field is valid is what keeps `aria-errormessage` honest: the
	// atom registers only while this element exists, so the control points at a message that is
	// actually on the page.
	const isInvalid = $derived(bond.isInvalid);
	const message = $derived(bond.errors[0]?.message ?? '');

	const el = Kernel.element(part, () => ({
		as,
		class: ['text-destructive mt-1 text-xs', '$preset', klass],
		...restProps
	}));
</script>

{@render (isInvalid ? error : undefined)?.()}

{#snippet error()}
	{@render Kernel.render(el)(
		el.tag(),
		el.class(),
		el.attrs(),
		children ?? defaultMessage,
		{ field: bond },
		el.motion(),
		el
	)}
{/snippet}

<!-- Consumers who want every message iterate `field.errors` themselves; one line is the common case. -->
{#snippet defaultMessage()}
	{message}
{/snippet}
