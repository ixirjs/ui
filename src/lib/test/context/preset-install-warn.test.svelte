<script lang="ts">
	import { installPreset } from '$ixirjs/ui/preset/context.svelte';

	// Called during component init on purpose — this fixture exists to prove the DEV guard fires.
	installPreset({ button: () => ({ class: 'warned' }) });
</script>

<div></div>
