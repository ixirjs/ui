<script lang="ts">
	// The control/form/overlay shapes, which `family-ssr-probe.test.svelte` never covered.
	//
	// A separate file rather than more `{:else if}` branches on that probe: its own comment records
	// that inserting a branch shifts every later family's `$props.id()` seed and rewrites snapshots
	// that did not change. Appending here costs nothing and moves nothing.
	// Together they provide byte-level coverage for Kernel-rendered control and host shapes.
	import { Switch } from '$ixirjs/ui/components/switch';
	import { Slider } from '$ixirjs/ui/components/slider';
	import { Checkbox } from '$ixirjs/ui/components/checkbox';
	import { Radio, RadioGroup } from '$ixirjs/ui/components/radio';
	import { Form, Field } from '$ixirjs/ui/components/form';
	import { Input } from '$ixirjs/ui/components/input';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { QRCode } from '$ixirjs/ui/components/qr-code';
	import { Container } from '$ixirjs/ui/components/container';
	import { Stepper, Step } from '$ixirjs/ui/components/stepper';

	export type Control =
		| 'switch'
		| 'slider'
		| 'checkbox'
		| 'radio'
		| 'form'
		| 'input-file'
		| 'portal-host'
		| 'qr-code'
		| 'container'
		| 'stepper-content';

	let { control }: { control: Control } = $props();
</script>

{#if control === 'switch'}
	<Switch checked={true} name="notify" />
{:else if control === 'slider'}
	<Slider value={40} name="volume" />
{:else if control === 'checkbox'}
	<Checkbox checked={true} name="agree" />
{:else if control === 'radio'}
	<RadioGroup value="a" name="pick">
		<Radio value="a">A</Radio>
		<Radio value="b">B</Radio>
	</RadioGroup>
{:else if control === 'form'}
	<Form>
		<Field.Root name="email">
			<Field.Label>Email</Field.Label>
			<Field.Control />
		</Field.Root>
	</Form>
{:else if control === 'input-file'}
	<Input.FileControl />
{:else if control === 'portal-host'}
	<PortalHost />
{:else if control === 'qr-code'}
	<QRCode value="https://example.com" />
{:else if control === 'container'}
	<Container>content</Container>
{:else}
	<Stepper.Root>
		<Stepper.Content />
		<Stepper.Header>
			<Step.Root index={0}>
				<Step.Title>One</Step.Title>
				{#snippet content()}
					step body
				{/snippet}
			</Step.Root>
		</Stepper.Header>
	</Stepper.Root>
{/if}
