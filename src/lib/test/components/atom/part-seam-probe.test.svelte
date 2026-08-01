<script lang="ts">
	import { HtmlAtom } from '$ixirjs/ui/components/atom';

	// `part` is overloaded: an object is the direct-part seam, a string is the CSS shadow-parts HTML
	// attribute. This probe renders the string form so the spec can assert it still reaches the DOM
	// instead of being swallowed by the seam.
	let { part = undefined }: { part?: string | undefined } = $props();
</script>

<HtmlAtom {part} class="seam-probe" data-testid="seam" />
