/**
 * Scrollable's shared object — a plain state class on the redesigned `Kernel`. Scroll geometry
 * and drag stay here; the track press and thumb drag handlers the pointer policies used to project
 * are written in those parts, and elements are found by the ids the parts render.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { clamp } from '$ixirjs/ui/utils/math';

export type ScrollableBondProps = {
	id?: string;
	scrollX: number;
	scrollY: number;
	scrollWidth: number;
	scrollHeight: number;
	clientWidth: number;
	clientHeight: number;
	disabled: boolean;
	// Whether custom scrollbars are visible.
	open: boolean;
	isScrolling?: boolean | undefined;
};

export type ScrollableBondElements = {
	root: HTMLElement;
	container: HTMLElement;
	content: HTMLElement;
	trackX: HTMLElement;
	trackY: HTMLElement;
	thumbX: HTMLElement;
	thumbY: HTMLElement;
};

export type ScrollAxis = 'x' | 'y';

export const ScrollableContext = Kernel.context<ScrollableBond>('bond/scrollable');

const byId = (id: string) =>
	typeof document === 'undefined' ? undefined : (document.getElementById(id) ?? undefined);

export class ScrollableBond {
	readonly name = 'scrollable';
	readonly props: ScrollableBondProps;
	readonly #parent: ScrollableBond | undefined;
	#dragOrigin = 0;

	constructor(props: ScrollableBondProps, parent?: ScrollableBond) {
		this.props = props;
		this.#parent = parent ?? ScrollableContext.get();
	}

	static create(props: ScrollableBondProps): ScrollableBond {
		return new ScrollableBond(props);
	}
	static get = (): ScrollableBond | undefined => ScrollableContext.get();

	get id(): string {
		return this.props.id ?? 'scrollable';
	}
	/** The id a part renders: `scrollable-<part>-<seed>`. */
	partId(part: keyof ScrollableBondElements): string {
		return Kernel.id(this.id, `scrollable-${part}`);
	}

	get parent() {
		return this.#parent;
	}

	/** The rendered elements, by the ids the parts render. `content` renders no id. */
	get elements(): { [K in keyof ScrollableBondElements]?: HTMLElement | undefined } {
		const id = (part: keyof ScrollableBondElements) => byId(this.partId(part));
		return {
			get root() {
				return id('root');
			},
			get container() {
				return id('container');
			},
			get trackX() {
				return id('trackX');
			},
			get trackY() {
				return id('trackY');
			},
			get thumbX() {
				return id('thumbX');
			},
			get thumbY() {
				return id('thumbY');
			}
		};
	}

	scrollTo(x: number, y: number) {
		this.elements.container?.scrollTo(x, y);
	}

	scrollBy(x: number, y: number) {
		this.elements.container?.scrollBy(x, y);
	}

	scrollIntoView(element: Element, options?: ScrollIntoViewOptions) {
		const container = this.elements.container;
		if (container && container.contains(element)) {
			element.scrollIntoView(options);
		}
	}

	updateScrollState() {
		const container = this.elements.container;
		if (!container) return;

		this.props.scrollX = container.scrollLeft;
		this.props.scrollY = container.scrollTop;
		this.props.scrollWidth = container.scrollWidth;
		this.props.scrollHeight = container.scrollHeight;
		this.props.clientWidth = container.clientWidth;
		this.props.clientHeight = container.clientHeight;
	}

	getThumbXPosition(): number {
		const { scrollX, clientWidth, scrollWidth } = this.props;
		if (scrollWidth <= clientWidth) return 0;
		const thumbSize = this.getThumbXSize();
		const maxPosition = 100 - thumbSize;
		const scrollPercentage = scrollX / (scrollWidth - clientWidth);
		return scrollPercentage * maxPosition;
	}

	getThumbYPosition(): number {
		const { scrollY, clientHeight, scrollHeight } = this.props;
		if (scrollHeight <= clientHeight) return 0;
		const thumbSize = this.getThumbYSize();
		const maxPosition = 100 - thumbSize;
		const scrollPercentage = scrollY / (scrollHeight - clientHeight);
		return scrollPercentage * maxPosition;
	}

	getThumbXSize(): number {
		const { clientWidth, scrollWidth } = this.props;
		if (scrollWidth <= clientWidth) return 100;
		return (clientWidth / scrollWidth) * 100;
	}

	getThumbYSize(): number {
		const { clientHeight, scrollHeight } = this.props;
		if (scrollHeight <= clientHeight) return 100;
		return (clientHeight / scrollHeight) * 100;
	}

	get canScrollX(): boolean {
		const { scrollWidth, clientWidth } = this.props;
		return scrollWidth > clientWidth;
	}

	get canScrollY(): boolean {
		const { scrollHeight, clientHeight } = this.props;
		return scrollHeight > clientHeight;
	}

	/** Max scroll distance on one axis; 0 when that axis does not overflow. */
	#maxScroll(axis: ScrollAxis): number {
		const container = this.elements.container;
		if (!container) return 0;
		return axis === 'x'
			? container.scrollWidth - container.clientWidth
			: container.scrollHeight - container.clientHeight;
	}

	/** Jump to the pressed fraction of the track. `percent` comes from the track press. */
	scrollToTrackFraction(axis: ScrollAxis, percent: number) {
		const container = this.elements.container;
		if (!container) return;
		const target = (percent / 100) * this.#maxScroll(axis);
		if (axis === 'x') container.scrollLeft = target;
		else container.scrollTop = target;
	}

	beginThumbDrag(axis: ScrollAxis) {
		const container = this.elements.container;
		// Stage `isScrolling` only once the drag can actually run, so a press with no container
		// cannot leave the scrollbars pinned visible.
		if (!container) return;
		this.#dragOrigin = axis === 'x' ? container.scrollLeft : container.scrollTop;
		this.props.isScrolling = true;
	}

	dragThumbBy(axis: ScrollAxis, delta: number) {
		const container = this.elements.container;
		const track = axis === 'x' ? this.elements.trackX : this.elements.trackY;
		if (!container || !track || !this.props.isScrolling) return;

		const rect = track.getBoundingClientRect();
		const trackSize = axis === 'x' ? rect.width : rect.height;
		if (trackSize <= 0) return;

		const maxScroll = this.#maxScroll(axis);
		const next = clamp(this.#dragOrigin + (delta / trackSize) * maxScroll, 0, maxScroll);
		if (axis === 'x') container.scrollLeft = next;
		else container.scrollTop = next;
	}

	endThumbDrag() {
		this.props.isScrolling = false;
	}
}
