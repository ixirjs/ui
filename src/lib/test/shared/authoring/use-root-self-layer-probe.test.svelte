<script lang="ts">
	import { useRoot } from '$ixirjs/ui/public/shared';
	import { SelfLayerProbeBond } from './use-root-probe.test.svelte';
	import type { PresetEntryRecord } from '$ixirjs/ui/preset/types';

	const ID = $props.id();
	const DECLARED_LAYER: PresetEntryRecord = { class: 'declared-layer' };

	// No `presetLayer` option is passed: the root resolves `presets.root` on its own.
	const root = useRoot(
		SelfLayerProbeBond,
		{ presets: () => ({ root: DECLARED_LAYER }) },
		{ id: () => ID }
	);
</script>

<div
	data-testid="self-layer-root"
	data-preset-layer-value={root.presetLayer === DECLARED_LAYER}
></div>
