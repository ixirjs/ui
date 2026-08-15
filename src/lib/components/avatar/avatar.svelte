<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { Icon } from '$ixirjs/ui/components/icon';
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

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		class: [
			'border-border bg-card hover:bg-card/95 active:bg-card/90 relative flex aspect-square h-10 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold',
			'$preset',
			klass
		],
		'data-type': 'avatar',
		'data-error': hasError,
		...avatarProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	typeof src === 'string' ? imageAvatar : iconAvatar,
	undefined,
	el.motion(),
	el
)}

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
