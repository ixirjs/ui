<script module lang="ts">
	const counts = new Map<string, number>();

	function mark(id: string, phase: string) {
		const key = `${id}:${phase}`;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}

	export function resetMotionPresentationProbe() {
		counts.clear();
	}

	export function motionPresentationCount(id: string, phase: string) {
		return counts.get(`${id}:${phase}`) ?? 0;
	}
</script>

<script lang="ts">
	import { HtmlAtom } from '$ixirjs/ui/components/atom';
	import { HtmlElement, SvgElement } from '$ixirjs/ui/components/element';
	import { setPreset } from '$ixirjs/ui/preset';

	let tick = $state(0);
	let showExitingHtml = $state(true);
	let showExitingSvg = $state(true);

	function nodeId(node: Element) {
		return node.getAttribute('data-testid') ?? 'unknown';
	}

	function initial(node: Element) {
		mark(nodeId(node), 'initial');
	}

	function animate(node: Element) {
		const id = nodeId(node);
		mark(id, 'animate');
		return () => mark(id, 'cleanup');
	}

	setPreset({
		button: () => ({
			motion: { initial, animate }
		})
	});
</script>

<button data-testid="tick" onclick={() => (tick += 1)}>tick</button>
<button
	data-testid="hide-exiting-elements"
	onclick={() => {
		showExitingHtml = false;
		showExitingSvg = false;
	}}>hide exiting elements</button
>

<HtmlElement preset="button" data-testid="html-motion" data-tick={tick}></HtmlElement>
<HtmlAtom preset="button" data-testid="atom-motion" data-tick={tick}></HtmlAtom>
<HtmlElement preset="button" motion={{ animate: null }} data-testid="phase-disabled"></HtmlElement>
<HtmlElement preset="button" motion={null} data-testid="all-disabled"></HtmlElement>
{#if showExitingHtml}
	<HtmlElement
		data-testid="html-exit"
		exit={() => ({ duration: 0 })}
		onexitend={() => mark('html-exit', 'exitend')}
	></HtmlElement>
{/if}

<svg>
	<SvgElement preset="button" data-testid="svg-motion" data-tick={tick}></SvgElement>
	{#if showExitingSvg}
		<SvgElement
			data-testid="svg-exit"
			exit={() => ({ duration: 0 })}
			onexitend={() => mark('svg-exit', 'exitend')}
		></SvgElement>
	{/if}
</svg>
