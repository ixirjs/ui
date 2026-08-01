<script lang="ts">
	import ToastRoot from '$ixirjs/ui/components/toast/toast-root.svelte';
	import ToastClose from '$ixirjs/ui/components/toast/toast-close.svelte';
	import type { ToastBond } from '$ixirjs/ui/components/toast/bond.svelte';
	import type { ToastRootProps } from '$ixirjs/ui/components/toast/types';

	let {
		open = true,
		onclose = undefined,
		onopenchange = undefined,
		duration = 0
	}: Pick<ToastRootProps, 'open' | 'onclose' | 'onopenchange' | 'duration'> = $props();
	let toastRoot: { getBond(): ToastBond };

	export function getBond(): ToastBond {
		return toastRoot.getBond();
	}
</script>

<ToastRoot bind:this={toastRoot} {open} {onclose} {onopenchange} {duration}>
	{#snippet children()}
		<ToastClose data-testid="toast-close" />
	{/snippet}
</ToastRoot>
