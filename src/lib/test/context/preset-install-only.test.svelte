<script lang="ts">
	import { getPreset, type PresetEntryRecord } from '$ixirjs/ui/preset/context.svelte';
	import { resolvePreset } from '$ixirjs/ui/authoring';

	// No setPreset/mergePreset here — this component never becomes a context provider. The installed
	// registry (set by the spec before render) must still answer `getPreset`.
	const entry = getPreset('button');
	const record = resolvePreset(entry?.({ bond: undefined })) as PresetEntryRecord | undefined;
</script>

<div data-class={Array.isArray(record?.class) ? record.class.join(' ') : record?.class}></div>
