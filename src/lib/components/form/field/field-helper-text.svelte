<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { FieldContext } from './bond.svelte';
	import type { FieldTextProps } from '$ixirjs/ui/components/form/types';

	const props: FieldTextProps = $props();
	const bond = FieldContext.getOrThrow('<Field.HelperText /> must be used within a <Field.Root />');

	// The description's id, written here so the root and the control can name it in
	// `aria-describedby`.
	const id = Kernel.id(bond.id, 'field-description');
	bond.descriptionId = id;

	const el = Kernel.element(() => props, {
		preset: 'field.helper-text',
		class: 'border-border text-muted-foreground mt-1 text-xs',
		state: bond,
		as: () => props.as ?? 'p',
		base: () => props.base,
		attrs: () => ({ id })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children, { field: bond })}
