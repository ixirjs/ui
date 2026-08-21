<script lang="ts">
	// Install block: package-manager switcher, the command, then the import line.
	import { createCopier } from '$docs/utils';

	type Props = { packageName: string; importCode: string };

	let { packageName, importCode }: Props = $props();

	const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;

	let manager = $state<(typeof MANAGERS)[number]>('npm');

	const copier = createCopier();

	const installCmd = $derived(
		manager === 'npm' ? `npm install ${packageName}` : `${manager} add ${packageName}`
	);
</script>

<div class="flex flex-col gap-2.5">
	<div class="border-border bg-surface flex w-fit gap-0.5 rounded-lg border p-[3px]">
		{#each MANAGERS as name (name)}
			<button
				type="button"
				onclick={() => (manager = name)}
				aria-pressed={manager === name}
				class={[
					'cursor-pointer rounded-md border-0 bg-transparent px-2.5 py-1 font-mono text-xs transition-colors',
					manager === name
						? 'bg-surface-2 text-foreground'
						: 'text-muted-foreground hover:text-foreground'
				]}>{name}</button
			>
		{/each}
	</div>

	<div class="border-border bg-code-bg flex items-center gap-2.5 rounded-lg border px-3.5 py-3">
		<span class="text-primary font-mono text-[13px]" aria-hidden="true">$</span>
		<code class="text-code-fg min-w-0 flex-1 overflow-x-auto font-mono text-[13px]"
			>{installCmd}</code
		>
		<button
			type="button"
			onclick={() => copier.run(installCmd, 'install')}
			class="border-border bg-surface text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-md border px-2 py-[3px] text-[11px] transition-colors"
			>{copier.label('install')}</button
		>
	</div>

	<div class="border-border bg-code-bg flex items-center gap-2.5 rounded-lg border px-3.5 py-3">
		<code class="text-code-fg min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-pre"
			>{importCode}</code
		>
		<button
			type="button"
			onclick={() => copier.run(importCode, 'import')}
			class="border-border bg-surface text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-md border px-2 py-[3px] text-[11px] transition-colors"
			>{copier.label('import')}</button
		>
	</div>
</div>
