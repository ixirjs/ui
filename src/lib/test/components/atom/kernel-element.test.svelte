<script
	lang="ts"
	generics="Tag extends HtmlElementTagName = 'div', BaseComponent extends Base = Base, Children extends AnySnippet = Snippet"
>
	// The shared probe for Kernel's own specs (css-part, resolve-count, transition-leaf,
	// lifecycle-ssr, presentation): one part that forwards everything a consumer can pass, so a
	// spec can drive any branch of the seam from props. Rewritten onto the redesigned Kernel when
	// the old facade was deleted on 2026-08-27.
	import { untrack, type Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName, PresetLike } from '$ixirjs/ui/preset';
	import type { AnySnippet, Base, HtmlElementTagName, RenderProps } from '$ixirjs/ui/kernel/types';

	type Props = RenderProps<Tag, BaseComponent, Children> & {
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
		variants = undefined,
		variantProps = undefined,
		motion = undefined,
		children = undefined,
		...restProps
	}: Props = $props();

	// `preset`/`bond` are read once, at init, the way every part reads its spec — `untrack` keeps
	// Svelte from warning that the reference captures only the initial value, which is the intent.
	const initialPreset = untrack(() => preset) as PresetModuleName | undefined;
	const initialBond = untrack(() => bond);
	const el = Kernel.element(
		() => ({ ...restProps, class: klass, variants, defaults: restProps.defaults }),
		{
			preset: initialPreset,
			class: '',
			state: initialBond,
			as: () => as as string | undefined,
			base: () => base,
			layer: () => presetLayer as PresetLike | undefined,
			variantProps: () => (variantProps ?? {}) as Record<string, unknown>,
			motion: () => motion as never
		}
	);
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children as Snippet | undefined)}
