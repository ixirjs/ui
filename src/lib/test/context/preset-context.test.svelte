<script lang="ts">
	import {
		getPreset,
		mergePreset,
		mergePresetLayers,
		setPreset,
		type PresetEntryRecord
	} from '$ixirjs/ui/context';
	import { resolvePreset } from '$ixirjs/ui/components/atom';

	setPreset({
		button: () => ({ class: 'base', attrs: { 'data-base': 'yes' } })
	});
	mergePreset(() => ({
		button: () => ({ class: 'override', attrs: { 'data-layer': 'yes' } })
	}));

	const entry = getPreset('button');
	const record = resolvePreset(entry?.({ bond: undefined })) as PresetEntryRecord | undefined;
	const explicit = resolvePreset(
		mergePresetLayers({ attrs: { role: 'button' } }, { attrs: { role: 'link' } })
	);
</script>

<div
	data-class={Array.isArray(record?.class) ? record.class.join(' ') : record?.class}
	data-base={record?.attrs?.['data-base']}
	data-layer={record?.attrs?.['data-layer']}
	data-role={explicit?.attrs?.role}
></div>
