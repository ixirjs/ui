<script lang="ts">
	import * as Table from '$shadcn/shadcn/table/index.js';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

<Table.Root>
	<Table.Body>
		{#each { length: n } as _, i (i)}
			<Table.Row class={tint}>
				<Table.Cell>Name {i}</Table.Cell>
				<Table.Cell>Email {i}</Table.Cell>
				<Table.Cell>Role {i}</Table.Cell>
			</Table.Row>
		{/each}
		<Table.Row class={bump}>
			<Table.Cell>Probe</Table.Cell>
			<Table.Cell>Probe</Table.Cell>
			<Table.Cell>Probe</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>
