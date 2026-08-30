<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { FieldContext } from './bond.svelte';
	import type { FieldLabelProps } from '$ixirjs/ui/components/form/types';

	const props: FieldLabelProps = $props();
	const bond = FieldContext.getOrThrow('<Field.Label /> must be used within a <Field.Root />');

	// The label's id, written here so the root and the control can name it in `aria-labelledby`.
	const id = Kernel.id(bond.id, 'field-label');
	bond.labelId = id;

	const el = Kernel.element(() => props, {
		preset: 'field.label',
		class: 'border-border flex',
		state: bond,
		as: () => props.as,
		base: () => props.base,
		attrs: () => ({ id, for: bond.controlId })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children, { field: bond })}
