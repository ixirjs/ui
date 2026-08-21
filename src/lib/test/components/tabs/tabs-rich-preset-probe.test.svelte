<script lang="ts">
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	import Probe from './tabs-atom-probe.test.svelte';

	setPreset({
		...defaultPreset,
		'tab.header': () => ({ class: 'rich-tab-header', attrs: { 'data-rich-preset': 'yes' } })
	});
</script>

<Probe />
