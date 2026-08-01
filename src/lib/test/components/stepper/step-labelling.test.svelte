<script lang="ts">
	import { Stepper } from '$ixirjs/ui/components/stepper';
	import { Step } from '$ixirjs/ui/components/stepper/step';

	// A consumer id on Title is the case the old string-template reference silently missed.
	let { titleId = undefined }: { titleId?: string | undefined } = $props();
</script>

<Stepper.Root activeStep={0}>
	<Step.Root index={0}>
		<Step.Header data-testid="step">
			<Step.Title id={titleId} data-testid="title">Details</Step.Title>
			<Step.Description data-testid="description">Tell us about you</Step.Description>
		</Step.Header>
	</Step.Root>
</Stepper.Root>
