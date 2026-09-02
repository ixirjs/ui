<script lang="ts">
	// bits-ui's popover with `ContentStatic` + `forceMount` — the non-portalled, always-rendered
	// variant, so the server emits content instead of an empty portal. Same reason as the menu
	// fixture. The class string is shadcn's `popover-content` verbatim; the vendored component
	// itself cannot be used, because it hardcodes the portal.
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	const CONTENT_CLASS =
		'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--bits-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden';
</script>

{#each { length: n } as _, i (i)}
	<PopoverPrimitive.Root open>
		<PopoverPrimitive.Trigger data-slot="popover-trigger">Open {i}</PopoverPrimitive.Trigger>
		<PopoverPrimitive.ContentStatic
			forceMount
			data-slot="popover-content"
			class="{CONTENT_CLASS} {tint}"
		>
			Content {i}
		</PopoverPrimitive.ContentStatic>
	</PopoverPrimitive.Root>
{/each}

<PopoverPrimitive.Root open>
	<PopoverPrimitive.Trigger data-slot="popover-trigger">Probe</PopoverPrimitive.Trigger>
	<PopoverPrimitive.ContentStatic
		forceMount
		data-slot="popover-content"
		class="{CONTENT_CLASS} {bump}"
	>
		Probe
	</PopoverPrimitive.ContentStatic>
</PopoverPrimitive.Root>
