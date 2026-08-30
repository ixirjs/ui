<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { Icon } from '$ixirjs/ui/components/icon';
	import type { AvatarProps } from './types';
	import './avatar.css';

	let { src = '', alt = '', ...restProps }: AvatarProps = $props();

	let hasError = $state(false);

	function getInitials(value: string) {
		return value
			.split(' ')
			.slice(0, 2)
			.map((d) => d.at(0)?.toUpperCase() ?? '')
			.join('');
	}

	const el = Kernel.element(() => restProps, {
		preset: 'avatar',
		class:
			'border-border bg-card hover:bg-card/95 active:bg-card/90 relative flex aspect-square h-10 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold',
		attrs: () => ({ 'data-type': 'avatar', 'data-error': hasError })
	});
</script>

<div {...el.attrs}>{@render (typeof src === 'string' ? imageAvatar : iconAvatar)()}</div>

<!-- `src as string` restores the `typeof` narrowing the dispatch performs; narrowing does not
     cross into a snippet body. -->
{#snippet imageAvatar()}
	<div class="absolute inset-0 flex items-center justify-center">
		<div>{getInitials(alt)}</div>
	</div>
	<img
		class="icare-avatar-image z-[1] h-full w-full"
		{alt}
		role="presentation"
		aria-hidden="true"
		src={src as string}
		onerror={() => {
			hasError = true;
		}}
	/>
{/snippet}

{#snippet iconAvatar()}
	<Icon
		aria-hidden="true"
		class="fui-avatar-icon h-full p-[4px] text-current"
		src={src as Exclude<typeof src, string>}
	/>
{/snippet}
