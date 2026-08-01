<script lang="ts">
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import Installation from './import-code.svelte';
	import { codeBlock } from '$docs/md/template';

	let {
		packageName,
		importCode
	}: {
		packageName: string;
		importCode: string;
	} = $props();

	const mode = getDocMode();
	const installCmd = $derived(`npm install ${packageName}`);
</script>

{#if mode === 'html'}
	<Installation {packageName} {importCode} />
{:else}
	{codeBlock(installCmd, 'bash')}

	{codeBlock(importCode, 'typescript')}
{/if}
