<script lang="ts">
	import { Form, Field, Input } from '$ixirjs/ui';
	import type { FormBond } from '$ixirjs/ui/components/form/bond.svelte';
	import type { ErrorRecord, StandardSchemaV1, ValidationSource } from '$ixirjs/ui/validation';
	import type { ValidationMode } from '$ixirjs/ui/components/form/bond.svelte';
	import type { FormRootProps } from '$ixirjs/ui/components/form/types';

	let {
		schema = undefined,
		source = undefined,
		errors = undefined,
		mode = undefined,
		blockInvalidSubmit = false,
		onvalidate = undefined,
		name = 'email',
		street = '',
		email = ''
	}: {
		schema?: StandardSchemaV1;
		source?: ValidationSource;
		errors?: ErrorRecord;
		mode?: ValidationMode;
		blockInvalidSubmit?: boolean;
		onvalidate?: FormRootProps['onvalidate'];
		name?: string;
		street?: string;
		email?: string;
	} = $props();

	let root = $state<ReturnType<typeof Form> | undefined>();

	export function getBond(): FormBond | undefined {
		return root?.getBond();
	}
</script>

<Form {schema} {source} {errors} {mode} {blockInvalidSubmit} {onvalidate} bind:this={root}>
	<Field.Root {name} value={email}>
		<Input.Root>
			<Field.Control base={Input.TextControl} data-testid="email" />
		</Input.Root>
		<Field.Error data-testid="email-error" />
	</Field.Root>

	<Field.Root name="address.street" value={street}>
		<Input.Root>
			<Field.Control base={Input.TextControl} data-testid="street" />
		</Input.Root>
		<Field.Error data-testid="street-error" />
	</Field.Root>

	<button type="submit" data-testid="submit">Send</button>
</Form>
