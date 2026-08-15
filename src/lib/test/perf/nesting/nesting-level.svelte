<script lang="ts">
	// The COMPONENT arm of the nesting benchmark: one level of the chain behind a real component
	// boundary — props proxy, context scope, children projected through the boundary.
	//
	// Its markup must stay byte-identical to `nesting-levels.svelte`'s `level` snippet once HTML
	// comments are stripped. The harness asserts that; if you edit one, edit both.
	import type { NestingLevelProps } from './types';

	let { depth, label, tint, deep, children }: NestingLevelProps = $props();
</script>

<div class="lvl {tint}" data-depth={depth}>
	<span class="lbl">{label}</span>
	{@render children?.(deep)}
</div>
