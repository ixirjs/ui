<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { TextareaRootProps } from './types';

	const ID = $props.id();
	let {
		as = undefined,
		base = undefined,
		initial = undefined,
		enter = undefined,
		exit = undefined,
		animate = undefined,
		children = undefined,
		...restProps
	}: TextareaRootProps = $props();

	// The root used to mount `Input.Root`; it renders that element itself now — same classes, same
	// `input-root-<seed>` id — and dispatches because `base` is in use (`<Textarea.Root base={Stack.Root}>`).
	const el = Kernel.element(() => restProps, {
		preset: 'textarea',
		class:
			'text-foreground bg-input relative flex h-10 w-auto items-center overflow-hidden rounded-md border h-auto',
		as: () => as,
		base: () => base,
		motion: () =>
			initial || enter || exit || animate ? { initial, enter, exit, animate } : undefined,
		attrs: () => ({ id: Kernel.id(ID, 'input-root') })
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, {})}
