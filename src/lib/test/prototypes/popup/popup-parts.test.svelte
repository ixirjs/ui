<script lang="ts">
	import { PopupContext, isComboboxBond, isDropdownMenuBond } from './bond.svelte';
	import { PopupAtom } from './atom.svelte';
	import Item from '$ixirjs/ui/test/prototypes/popup/popup-item.test.svelte';

	let { values }: { values: readonly string[] } = $props();
	const bond = PopupContext.getOrThrow();
	const trigger = PopupAtom.trigger(bond);
	const content = PopupAtom.content(bond);
	const query = isComboboxBond(bond) ? PopupAtom.query(bond) : undefined;
	const hasItems = isDropdownMenuBond(bond);
</script>

<button {...trigger.attrs}>Open</button>
{@render (query ? queryInput : undefined)?.()}
<div {...content.attrs}>
	{@render (hasItems ? items : description)()}
</div>

{#snippet queryInput()}
	<input {...query!.attrs} />
{/snippet}

{#snippet items()}
	{#each values as value (value)}
		<Item {value} />
	{/each}
{/snippet}

{#snippet description()}
	Popup content
{/snippet}
