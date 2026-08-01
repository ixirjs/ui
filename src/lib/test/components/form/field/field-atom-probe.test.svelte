<script lang="ts" module>
	import type { FieldBond } from '$ixirjs/ui/components/form/field/bond.svelte';

	export let capturedBond: FieldBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Field } from '$ixirjs/ui/components/form/field';

	function capture(bond: FieldBond | undefined): string {
		capturedBond = bond;
		return '';
	}
</script>

<Field.Root value="Ada">
	{#snippet children({ field }: { field: FieldBond | undefined })}
		{capture(field)}
		<Field.Label>Name</Field.Label>
		<Field.Control />
		<Field.HelperText>Use your public display name.</Field.HelperText>
	{/snippet}
</Field.Root>
