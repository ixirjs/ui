/**
 * The preset provider's shared object — a plain state class on the redesigned `Kernel`.
 *
 * A `renderers` slot ({ html, svg, mathml }) was removed from here. `html` was always the default
 * `HtmlElement` and only served to push every part off the native render seam; `svg` and `mathml`
 * were never read. Renderer selection is per element, through the `base` prop.
 * See docs/research/root-renderer-slot-2026-08.md.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';

export type RootStateProps<T extends Record<string, unknown> = Record<string, unknown>> = {
	id?: string | undefined;
	extend: T;
};

export const RootContext = Kernel.context<RootBond>('bond/root');

export class RootBond {
	readonly name = 'root';
	readonly props: RootStateProps;
	/** The host element, once it has rendered. */
	rootElement = $state<HTMLElement | undefined>();

	constructor(props: RootStateProps) {
		this.props = props;
	}

	static create(props: RootStateProps): RootBond {
		return new RootBond(props);
	}

	get id(): string {
		return this.props.id ?? 'root';
	}
}
