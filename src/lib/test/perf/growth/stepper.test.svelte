<script lang="ts">
	import { Step, Stepper } from '$ixirjs/ui/components/stepper';

	let { n = 100 }: { n?: number } = $props();
</script>

<Stepper.Root>
	<Stepper.Header>
		{#each { length: n } as _, i (i)}
			<Step.Root index={i}>
				<Step.Header>
					<Step.Title>Step {i}</Step.Title>
				</Step.Header>
				<Step.Body>Body {i}</Step.Body>
			</Step.Root>
		{/each}
	</Stepper.Header>
</Stepper.Root>
