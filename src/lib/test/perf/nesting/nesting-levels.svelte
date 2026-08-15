<script module lang="ts">
	// The SNIPPET arm of the nesting benchmark: the same level as a module snippet, the shape
	// Kernel uses in the library's hot path — `{@render level(...)}`
	// is a function call into the caller's renderer, with no component boundary, no props proxy and
	// no context scope.
	//
	// Cross-file on purpose. A same-file snippet cannot be reused, so it is not a substitute for a
	// component and measuring it would answer a question nobody asks.
	//
	// Its markup must stay byte-identical to `nesting-level.svelte` once HTML comments are
	// stripped. The harness asserts that; if you edit one, edit both.
	import type { NestingBody, NestingLevelData } from './types';

	export { level, levelPacket };
</script>

<!-- Positional parameters, the shape Kernel.render uses. Each argument is its own
     reactive cell, which is the snippet-side equivalent of declaring props one by one. -->
{#snippet level(depth: number, label: string, tint: string, deep: number, body?: NestingBody)}
	<div class="lvl {tint}" data-depth={depth}>
		<span class="lbl">{label}</span>
		{@render body?.(deep)}
	</div>
{/snippet}

<!-- The same level taking ONE object, the snippet-side analogue of spreading a props packet into a
     component. Identical markup on purpose: the only difference from `level` is that every field
     arrives through a single argument, so touching any one of them invalidates the reader of all
     four. That is the cost this arm exists to price. -->
{#snippet levelPacket(data: NestingLevelData, body?: NestingBody)}
	<div class="lvl {data.tint}" data-depth={data.depth}>
		<span class="lbl">{data.label}</span>
		{@render body?.(data.deep)}
	</div>
{/snippet}
