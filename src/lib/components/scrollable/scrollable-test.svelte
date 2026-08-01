<script lang="ts">
	import * as Scrollable from './atoms';

	let scrollY = $state(0);
	let scrollHeight = $state(0);
	let clientHeight = $state(0);
</script>

<Scrollable.Root
	bind:scrollY
	bind:scrollHeight
	bind:clientHeight
	style="height: 100px; width: 200px;"
>
	{#snippet children({ scrollable })}
		<Scrollable.Container
			data-testid="viewport"
			style="height: 100px; width: 200px; overflow: auto;"
		>
			<Scrollable.Content>
				<div style="height: 600px; width: 180px;">Scrollable body</div>
			</Scrollable.Content>
		</Scrollable.Container>
		<Scrollable.Track orientation="vertical" data-testid="track">
			<Scrollable.Thumb orientation="vertical" data-testid="thumb" />
		</Scrollable.Track>

		<output data-testid="bond-scroll-y">{scrollable.state.props.scrollY}</output>
		<output data-testid="bond-scroll-height">{scrollable.state.props.scrollHeight}</output>
		<output data-testid="bond-client-height">{scrollable.state.props.clientHeight}</output>
		<output data-testid="bond-can-scroll-y">{String(scrollable.canScrollY)}</output>
	{/snippet}
</Scrollable.Root>

<output data-testid="bound-scroll-y">{scrollY}</output>
<output data-testid="bound-scroll-height">{scrollHeight}</output>
<output data-testid="bound-client-height">{clientHeight}</output>
