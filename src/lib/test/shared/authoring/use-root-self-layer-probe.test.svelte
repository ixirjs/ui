<script lang="ts">
	import { useRoot } from '$ixirjs/ui/public/shared';
	import { SelfLayerProbeBond } from './use-root-probe.test.svelte';
	import type { PresetEntryRecord } from '$ixirjs/ui/preset/types';

	const ID = $props.id();
	const DECLARED_LAYER: PresetEntryRecord = { class: 'declared-layer' };

	// No `presetLayer` option is passed. The layer must come from the definition's
	// `atoms: { root: { atom, selfLayer: true } }` alone.
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
