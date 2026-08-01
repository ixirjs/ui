<script lang="ts">
	import { Chip } from '$lib/components/chip';
</script>

<!-- Each chip carries its own dismiss handler; the label is the chip's children. -->
<div class="flex flex-wrap items-center gap-2">
	<Chip ondismiss={() => {}}>Svelte</Chip>
	<Chip ondismiss={() => {}}>TypeScript</Chip>
	<Chip ondismiss={() => {}}>Tailwind</Chip>
	<Chip ondismiss={() => {}}>Vite</Chip>
</div>
