<script lang="ts">
	// The ZERO-ABSTRACTION control for the tree family — hand-written markup, no library.
	//
	// shadcn-svelte ships no tree, so there is no vendored opponent to compare against. The honest
	// substitute is the same thing `plain` is in `bench:ssr`: the markup a developer would write by
	// hand, with the same ARIA. It is a floor, not a competitor — a real tree component still has to
	// implement the keyboard model this control does not have. Read the gap as "what the behaviour
	// costs", not as "how far behind we are".
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

<ul role="tree" class="tree">
	<li role="treeitem" aria-expanded="true" aria-selected="false" tabindex="0">
		<div class="tree-header">Root</div>
		<ul role="group">
			{#each { length: n } as _, i (i)}
				<li role="treeitem" aria-expanded="true" aria-selected="false" tabindex="-1" class={tint}>
					<div class="tree-header">Node {i}</div>
					<ul role="group">
						<li>Body {i}</li>
					</ul>
				</li>
			{/each}
			<li role="treeitem" aria-expanded="true" aria-selected="false" tabindex="-1" class={bump}>
				<div class="tree-header">Probe</div>
				<ul role="group">
					<li>Probe</li>
				</ul>
			</li>
		</ul>
	</li>
</ul>
