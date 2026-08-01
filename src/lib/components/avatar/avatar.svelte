<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import type { AvatarProps } from './types';
	import './avatar.css';

	let {
		class: klass = '',
		preset = undefined,
		src = '',
		alt = '',
		...restProps
	}: AvatarProps = $props();

	const avatarProps = $derived(mergePresetProps(preset, 'avatar', restProps));

	let hasError = $state(false);

	function getInitials(value: string) {
		return value
			.split(' ')
			.slice(0, 2)
			.map((d) => d.at(0)?.toUpperCase() ?? '')
			.join('');
	}
</script>

<HtmlAtom
	class={[
		'border-border bg-card hover:bg-card/95 active:bg-card/90 relative flex aspect-square h-10 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold',
		'$preset',
		klass
	]}
	data-type="avatar"
	data-error={hasError}
	{...avatarProps}
>
	{#if typeof src === 'string'}
		<div class="absolute inset-0 flex items-center justify-center">
			<div>{getInitials(alt)}</div>
		</div>
		<img
			class="icare-avatar-image z-[1] h-full w-full"
			{alt}
			role="presentation"
			aria-hidden="true"
			{src}
			onerror={() => {
				hasError = true;
			}}
		/>
	{:else}
		<Icon aria-hidden="true" class="fui-avatar-icon h-full p-[4px] text-current" {src} />
	{/if}
</HtmlAtom>
