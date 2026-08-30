<script lang="ts">
	// The same composition as the layer probe, with a preset installed that marks every fused slot
	// with the `popover-dialog.*` key it must resolve. That is what the old spec asserted by reading
	// `new DialogHeaderAtom(bond).preset`; there are no Atoms to read now, so the key is pinned where
	// it is observable — on the rendered class.
	import { setPreset } from '$ixirjs/ui/preset';
	import Probe from './popover-dialog-preset-probe.test.svelte';

	setPreset({
		'popover-dialog': () => ({ class: 'key-root' }),
		'popover-dialog.trigger': () => ({ class: 'key-trigger' }),
		'popover-dialog.content': () => ({ class: 'key-content' }),
		'popover-dialog.header': () => ({ class: 'key-header' }),
		'popover-dialog.title': () => ({ class: 'key-title' }),
		'popover-dialog.description': () => ({ class: 'key-description' }),
		'popover-dialog.body': () => ({ class: 'key-body' }),
		'popover-dialog.footer': () => ({ class: 'key-footer' }),
		'popover-dialog.close': () => ({ class: 'key-close' })
	});
</script>

<Probe presets={{}} />
