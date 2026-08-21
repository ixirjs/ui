<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { SelectBond } from './bond.svelte';
	const PART = Kernel.plan(SelectBond, 'query', { class: '' });
</script>

<script lang="ts">
	import { Input } from '$ixirjs/ui/components/input';
	import type { SelectQueryProps } from './types';

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		...restProps
	}: SelectQueryProps = $props();

	// The `query` atom plays role 'input' (`'query'` target): its spread carries the
	// projected combobox a11y (role, aria-autocomplete/expanded/controls/activedescendant)
	// and an `oninput` that writes `props.query`.
	const part = Kernel.node(PART, () => ({ preset }), {
		context: 'required',
		rest: () => restProps
	});
	const bond = part.bond;
</script>

<!-- The control's text IS the bond's `query` (the `'input'` capability's `query` field):
     typing filters the items, Escape (`ClearThenClose` → `InputModel.clear`) empties it.
     `value` mirrors it for the public bindable API. -->
<Input.Control
	bind:value={
		() => bond.props.query ?? '',
		(v) => {
			bond.props.query = v;
			value = v;
		}
	}
	class={['inline-flex h-auto w-auto flex-1 py-1', '$preset', klass]}
	{...part.props}
/>
