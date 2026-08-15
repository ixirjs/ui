<script
	lang="ts"
	generics="Tag extends HtmlElementTagName = 'div', BaseComponent extends Base = Base, Children extends AnySnippet = Snippet"
>
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { PresentableAtom } from '$ixirjs/ui/shared/bond/presentation-props';
	import type {
		AnySnippet,
		Base,
		HtmlElementTagName,
		RenderProps
	} from '$ixirjs/ui/components/atom/types';

	type Props = RenderProps<Tag, BaseComponent, Children> & {
		atom?: PresentableAtom;
		defaults?: Record<string, unknown> | undefined;
		part?: string | undefined;
		variantProps?: Record<string, unknown> | undefined;
	};

	let {
		class: klass = '',
		as = undefined,
		base = undefined,
		preset = undefined,
		presetLayer = undefined,
		bond = undefined,
		atom = undefined,
		variants = undefined,
		variantProps = undefined,
		defaults = undefined,
		motion = undefined,
		oninit = undefined,
		children = undefined,
		...restProps
	}: Props = $props();

	const el = Kernel.element(
		Kernel.static,
		() => ({
			class: klass,
			as,
			base,
			preset,
			presetLayer,
			bond,
			atom,
			variants,
			variantProps,
			defaults,
			motion,
			oninit
		}),
		() => restProps
	);
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children as Snippet | undefined,
	Kernel.forward,
	el.motion(),
	el
)}
