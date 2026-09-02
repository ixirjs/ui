<script lang="ts">
	import {
		getPreset,
		mergePresetLayers,
		setPreset,
		type PresetEntryRecord
	} from '$ixirjs/ui/preset/context.svelte';
	import { resolvePreset } from '$ixirjs/ui/authoring';

	// The installed registry is set by the spec before render. A subtree override for `button` wins
	// for its own key and falls back to the installed entry for `card.title`, unaffected.
	setPreset({
		button: () => ({ class: 'override', attrs: { 'data-layer': 'yes' } })
	});

	const buttonEntry = getPreset('button');
	const button = resolvePreset(buttonEntry?.({ bond: undefined })) as PresetEntryRecord | undefined;

	const titleEntry = getPreset('card.title');
	const title = resolvePreset(titleEntry?.({ bond: undefined })) as PresetEntryRecord | undefined;

	const explicit = resolvePreset(
		mergePresetLayers({ attrs: { role: 'a' } }, { attrs: { role: 'b' } })
	);
</script>

<div
	data-button-class={Array.isArray(button?.class) ? button.class.join(' ') : button?.class}
	data-button-layer={button?.attrs?.['data-layer']}
	data-title-class={Array.isArray(title?.class) ? title.class.join(' ') : title?.class}
	data-role={explicit?.attrs?.role}
></div>
