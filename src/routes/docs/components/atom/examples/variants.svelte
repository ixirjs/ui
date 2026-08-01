<script lang="ts">
	import { HtmlAtom } from '$lib/components/atom';
</script>

<div class="flex flex-wrap gap-3">
	<HtmlAtom as="button" class="rounded bg-blue-500 px-2 py-1 text-sm text-white"
		>Small Primary</HtmlAtom
	>
	<HtmlAtom as="button" class="rounded bg-blue-500 px-4 py-2 text-white">Medium Primary</HtmlAtom>
	<HtmlAtom as="button" class="rounded bg-gray-500 px-4 py-2 text-white">Secondary</HtmlAtom>
</div>
