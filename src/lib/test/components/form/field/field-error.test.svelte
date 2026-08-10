<script lang="ts" module>
	import type { FieldBond } from '$ixirjs/ui/components/form/field/bond.svelte';

	export let capturedField: FieldBond | undefined;
</script>

<script lang="ts">
	import { Field, Input, defineSchema } from '$ixirjs/ui';

	let { value = $bindable(''), renderError = true }: { value?: string; renderError?: boolean } =
		$props();

	// `defineSchema` is the escape hatch for a rule with no schema library behind it.
	const schema = defineSchema<string>((input) => (input ? undefined : 'Name is required'));

	function capture(field: FieldBond | undefined): string {
		capturedField = field;
		return '';
	}
</script>

<Field.Root name="probe" required {schema} mode="manual">
	{#snippet children({ field }: { field: FieldBond | undefined })}
		{capture(field)}
		<Field.Label>Name</Field.Label>
		<Input.Root>
			<Field.Control base={Input.TextControl} bind:value data-testid="probe-control" />
		</Input.Root>
		<Field.HelperText>Your full name</Field.HelperText>
		{@render (renderError ? errorPart : undefined)?.()}
	{/snippet}
</Field.Root>

{#snippet errorPart()}
	<Field.Error />
{/snippet}
