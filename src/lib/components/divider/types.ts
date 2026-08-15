import type { RenderProps, Base, HtmlElementTagName } from '$ixirjs/ui/components/atom';

export interface DividerProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B> {
	/**
	 * Vertical
	 * @default false
	 */
	vertical?: boolean;
	/**
	 * Transparent
	 * @default false
	 */
	transparent?: boolean;
}
