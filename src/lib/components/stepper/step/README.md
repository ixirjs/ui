# Step

One item in a `Stepper` workflow.

## Usage

```svelte
<Stepper.Root>
	<Stepper.Header>
		<Step.Root index={0}>
			<Step.Header>
				<Step.Indicator />
				<Step.Title>Account Setup</Step.Title>
				<Step.Description>Create your account</Step.Description>
			</Step.Header>

			<Step.Body>Step content</Step.Body>
		</Step.Root>
	</Stepper.Header>

	<Stepper.Body>
		<Stepper.Content />
	</Stepper.Body>
</Stepper.Root>
```

## Props

`Step.Root` accepts `index`, `completed`, `optional`, and `disabled`.

## Notes

- `Step.Body` registers content with the parent stepper.
- `Stepper.Content` renders the active registered body.
- State is derived from the active step index plus the step props.
