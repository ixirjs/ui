<script lang="ts" generics="E extends HtmlElementTagName = 'button', B extends Base = Base">
	import { Icon } from '$ixirjs/ui/components/icon';
	import Close from '$ixirjs/ui/icons/icon-close.svelte';
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { DialogContext } from './bond.svelte';
	import type { DialogCloseButtonProps } from './types';

	let {
		as = 'button' as E,
		base = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: DialogCloseButtonProps<E, B> & BasePropsOf<B> = $props();

	const bond = DialogContext.getOrThrow('<Dialog.Close /> must be used within a <Dialog.Root />');
	const id =
		untrack(() => restProps.id as string | undefined) ?? Kernel.id(bond.id, `${bond.name}-close`);

	function close(event: Event) {
		bond.stageOpenChange({ event, reason: 'close-button' });
		bond.close();
	}
	// Gated on `defaultPrevented` here, not only through `Kernel.compose`: a consumer can prevent
	// the default from a listener of their own, with no `onclick` prop for the seam to compose.
	function click(event: MouseEvent) {
		if (event.defaultPrevented) return;
		close(event);
	}
	function keydown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
		event.preventDefault();
		close(event);
	}

	// Dispatches: `as` is a documented prop (a `<span>` close control grows a button role and a tab
	// stop), and a preset may name a renderer.
	const el = Kernel.element(() => restProps, {
		preset: `${bond.name}.close` as PresetModuleName,
		class: 'cursor-pointer',
		state: bond,
		as: () => as,
		base: () => base,
		layer: () => bond.props.presets?.closeButton,
		attrs: () => {
			const isButton = as === 'button';
			const attrs: Record<string, unknown> = {
				id,
				type: isButton ? 'button' : undefined,
				role: isButton ? undefined : 'button',
				tabindex: isButton ? undefined : 0,
				// Composed with the consumer's, read here so a swapped handler is seen: theirs runs
				// first, and preventing default keeps the dialog open.
				onclick: Kernel.compose(onclick, click),
				onkeydown: Kernel.compose(onkeydown, keydown)
			};
			if (bond.isDisabled) {
				attrs.disabled = true;
				attrs['aria-disabled'] = 'true';
				attrs.tabindex = -1;
			}
			return attrs;
		}
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block,
	// no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, body)}

{#snippet body()}
	{@render (children ?? fallback)({ dialog: bond })}
{/snippet}

{#snippet fallback()}
	<Icon>
		<Close />
	</Icon>
{/snippet}
