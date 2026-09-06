<script lang="ts">
	import { Input } from '@ixirjs/ui';

	let number = $state(1);
	let step = $state(0);
	let disabled = $state(false);
	let calls = $state(0);
	let aliases = $state(0);
	let observed = $state('');
	let visible = $state(false);
	let visibility = $state('');
	let time = $state('11:59');
</script>

<Input.NumberControl
	aria-label="Compat number"
	bind:number
	{step}
	min={0}
	max={2}
	{disabled}
	onvaluechange={(_, context) => {
		calls++;
		observed = `${number}:${context.reason}:${Boolean(context.event)}`;
	}}
	onnumberchange={() => aliases++}
>
	{#snippet increment({ action })}
		<button data-testid="number-increment" onclick={() => action()}>Increment without event</button>
	{/snippet}
	{#snippet decrement({ action })}
		<button data-testid="number-decrement" onclick={() => action()}>Decrement without event</button>
	{/snippet}
</Input.NumberControl>
<button data-testid="number-step" onclick={() => (step = 1)}>Use step one</button>
<button data-testid="disable-inputs" onclick={() => (disabled = true)}>Disable inputs</button>
<output data-testid="number-contract">{number}:{calls}:{aliases}:{observed}</output>

<Input.PasswordControl
	aria-label="Compat password"
	value="secret"
	bind:visible
	readonly
	{disabled}
	onvisiblechange={(_, context) => {
		visibility = `${visible}:${context.value}:${context.reason}:${Boolean(context.event)}`;
	}}
>
	{#snippet toggleContent({ toggle })}
		<button data-testid="password-toggle" onclick={() => toggle()}>Toggle without event</button>
	{/snippet}
</Input.PasswordControl>
<output data-testid="password-contract">{visible}:{visibility}</output>

<Input.TimeControl bind:value={time} hourFormat={12} />
<output data-testid="time-contract">{time}</output>
