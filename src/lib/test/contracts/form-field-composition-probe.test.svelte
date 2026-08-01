<script lang="ts">
	import { Form, Field } from '$ixirjs/ui/components/form';
	import type { FormBond } from '$ixirjs/ui/components/form/bond.svelte';

	let form = $state<{ getBond(): FormBond }>();

	export function getBond() {
		return form?.getBond();
	}
</script>

<Form bind:this={form}>
	<Field.Root name="email" value="ada@example.test" />
</Form>
