import { bondContextKey, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';

/**
 * A `renderers` slot ({ html, svg, mathml }) was removed from here. `html` was always the default
 * `HtmlElement` and only served to push every part off the native render seam; `svg` and `mathml`
 * were never read. Renderer selection is per element, through the `base` prop.
 * See docs/research/root-renderer-slot-2026-08.md.
 */
export type RootStateProps<T extends Record<string, unknown> = Record<string, unknown>> =
	BondStateProps & {
		extend: T;
	};

export class RootBond extends Bond<RootStateProps> {
	static CONTEXT_KEY = bondContextKey('root');

	constructor(props: RootStateProps) {
		super(props);
	}

	get rootElement() {
		return this.elements.root as HTMLElement | undefined;
	}
	set rootElement(el: HTMLElement | undefined) {
		this.elements.root = el;
	}
}
