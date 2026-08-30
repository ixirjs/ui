<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { FieldContext } from './bond.svelte';
	import type { FieldErrorProps } from '$ixirjs/ui/components/form/types';

	let {
		as = 'p',
		base = undefined,
		children = undefined,
		...restProps
	}: FieldErrorProps = $props();
	const bond = FieldContext.getOrThrow('<Field.Error /> must be used within a <Field.Root />');

	// The error's id, written here so the control (`aria-errormessage`) and the root
	// (`aria-describedby`) can name it. Both read it only while the field is invalid — which is
	// exactly when this element renders — so the reference never dangles.
	const id = Kernel.id(bond.id, 'field-error');
	bond.errorId = id;

	const el = Kernel.element(() => restProps, {
		preset: 'field.error',
		class: 'border-border text-destructive mt-1 text-xs',
		state: bond,
		as: () => as,
		base: () => base,
		// `role="alert"` is safe here because the element renders only while invalid, so the
		// announcement fires when the error appears, not on mount.
		attrs: () => ({
			id,
			'data-invalid': '',
			'data-validating': bond.isValidating ? '' : undefined,
			role: 'alert'
		})
	});

	// Rendering nothing while the field is valid is what keeps `aria-errormessage` honest.
	const isInvalid = $derived(bond.isInvalid);
	const message = $derived(bond.errors[0]?.message ?? '');
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render (isInvalid ? error : undefined)?.()}

{#snippet error()}
	{@render leaf(el, children ?? defaultMessage, { field: bond })}
{/snippet}

<!-- Consumers who want every message iterate `field.errors` themselves; one line is the common case. -->
{#snippet defaultMessage()}
	{message}
{/snippet}
