import { Bond, BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import { clamp } from '$svelte-atoms/core/utils/math';

export type ScrollableBondProps = BondStateProps & {
	scrollX: number;
	scrollY: number;
	scrollWidth: number;
	scrollHeight: number;
	clientWidth: number;
	clientHeight: number;
	disabled: boolean;
	// Whether custom scrollbars are visible.
	open: boolean;
	isScrolling?: boolean;
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

export class ScrollableRootAtom extends BondAtom<ScrollableBondBase> {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'root');
	}

	override get attrs() {
		const props = this.bond.state.props;

		return {
			...super.attrs,
			'data-disabled': props.disabled,
			'data-open': props.open
		};
	}
}

export class ScrollableContainerAtom extends BondAtom<ScrollableBondBase> {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'container');
	}

	override get handlers() {
		return {
			onscroll: () => {
				this.bond.updateScrollState();
			}
		};
	}

	override onmount() {
		this.bond.updateScrollState();
	}
}

export class ScrollableContentAtom extends BondAtom<ScrollableBondBase> {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'content');
	}
}

// Track atom; axis fixed at construction.
export class ScrollableTrackAtom extends BondAtom<ScrollableBondBase> {
	#axis: 'x' | 'y';

	constructor(bond: ScrollableBondBase, axis: 'x' | 'y') {
		super(bond, axis === 'x' ? 'trackX' : 'trackY');
		this.#axis = axis;
	}

	override get attrs() {
		const canScroll = this.#axis === 'x' ? this.bond.canScrollX : this.bond.canScrollY;

		return {
			...super.attrs,
			'data-visible': canScroll,
			'data-direction': this.#axis === 'x' ? 'horizontal' : 'vertical'
		};
	}

	override get handlers() {
		return {
			onclick: (e: MouseEvent) => {
				this.bond.handleTrackClick(e, this.#axis);
			}
		};
	}
}

// Thumb atom; axis fixed at construction.
export class ScrollableThumbAtom extends BondAtom<ScrollableBondBase> {
	#axis: 'x' | 'y';

	constructor(bond: ScrollableBondBase, axis: 'x' | 'y') {
		super(bond, axis === 'x' ? 'thumbX' : 'thumbY');
		this.#axis = axis;
	}

	override get attrs() {
		const position =
			this.#axis === 'x' ? this.bond.getThumbXPosition() : this.bond.getThumbYPosition();
		const size = this.#axis === 'x' ? this.bond.getThumbXSize() : this.bond.getThumbYSize();

		const styleProperty = this.#axis === 'x' ? 'left' : 'top';
		const sizeProperty = this.#axis === 'x' ? 'width' : 'height';

		return {
			...super.attrs,
			'data-direction': this.#axis === 'x' ? 'horizontal' : 'vertical',
			style: `${styleProperty}: ${position}%; ${sizeProperty}: ${size}%;`
		};
	}

	override get handlers() {
		return {
			onmousedown: (e: MouseEvent) => {
				this.bond.handleThumbDrag(e, this.#axis);
			}
		};
	}
}

// defineBond constructs atoms as `new Ctor(bond)`, so each axis needs its own zero-arg subclass.
class ScrollableTrackXAtom extends ScrollableTrackAtom {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'x');
	}
}
class ScrollableTrackYAtom extends ScrollableTrackAtom {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'y');
	}
}
class ScrollableThumbXAtom extends ScrollableThumbAtom {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'x');
	}
}
class ScrollableThumbYAtom extends ScrollableThumbAtom {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'y');
	}
}

// Hand-written base: scroll geometry, drag, measurement, and parent-context capture; defineBond extends it.
class ScrollableBondBase extends Bond<ScrollableBondProps, ScrollableState> {
	#parent: ScrollableBond | undefined;

	constructor(state: ScrollableState) {
		super(state, 'scrollable');
		this.#parent = ScrollableBond.get();
	}

	get parent() {
		return this.#parent;
	}

	// Narrows the inherited element registry to concrete HTMLElements (hides VirtualElement).
	override get elements(): Partial<ScrollableBondElements> & Record<string, HTMLElement | undefined> {
		return super.elements as Partial<ScrollableBondElements> & Record<string, HTMLElement | undefined>;
	}

	scrollTo(x: number, y: number) {
		const container = this.elements.container;
		if (container) {
			container.scrollTo(x, y);
		}
	}

	scrollBy(x: number, y: number) {
		const container = this.elements.container;
		if (container) {
			container.scrollBy(x, y);
		}
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

		this.state.props.scrollX = container.scrollLeft;
		this.state.props.scrollY = container.scrollTop;
		this.state.props.scrollWidth = container.scrollWidth;
		this.state.props.scrollHeight = container.scrollHeight;
		this.state.props.clientWidth = container.clientWidth;
		this.state.props.clientHeight = container.clientHeight;
	}

	getThumbXPosition(): number {
		const { scrollX, clientWidth, scrollWidth } = this.state.props;
		if (scrollWidth <= clientWidth) return 0;
		const thumbSize = this.getThumbXSize();
		const maxPosition = 100 - thumbSize;
		const scrollPercentage = scrollX / (scrollWidth - clientWidth);
		return scrollPercentage * maxPosition;
	}

	getThumbYPosition(): number {
		const { scrollY, clientHeight, scrollHeight } = this.state.props;
		if (scrollHeight <= clientHeight) return 0;
		const thumbSize = this.getThumbYSize();
		const maxPosition = 100 - thumbSize;
		const scrollPercentage = scrollY / (scrollHeight - clientHeight);
		return scrollPercentage * maxPosition;
	}

	getThumbXSize(): number {
		const { clientWidth, scrollWidth } = this.state.props;
		if (scrollWidth <= clientWidth) return 100;
		return (clientWidth / scrollWidth) * 100;
	}

	getThumbYSize(): number {
		const { clientHeight, scrollHeight } = this.state.props;
		if (scrollHeight <= clientHeight) return 100;
		return (clientHeight / scrollHeight) * 100;
	}

	get canScrollX(): boolean {
		const { scrollWidth, clientWidth } = this.state.props;
		return scrollWidth > clientWidth;
	}

	get canScrollY(): boolean {
		const { scrollHeight, clientHeight } = this.state.props;
		return scrollHeight > clientHeight;
	}

	handleTrackClick(e: MouseEvent, axis: 'x' | 'y') {
		const container = this.elements.container;
		const track = axis === 'x' ? this.elements.trackX : this.elements.trackY;
		if (!container || !track) return;

		const rect = track.getBoundingClientRect();
		const clickPosition = axis === 'x' ? e.clientX - rect.left : e.clientY - rect.top;
		const trackSize = axis === 'x' ? rect.width : rect.height;
		const percentage = clickPosition / trackSize;

		if (axis === 'x') {
			const maxScrollX = container.scrollWidth - container.clientWidth;
			container.scrollLeft = percentage * maxScrollX;
		} else {
			const maxScrollY = container.scrollHeight - container.clientHeight;
			container.scrollTop = percentage * maxScrollY;
		}
	}

	handleThumbDrag(e: MouseEvent, axis: 'x' | 'y') {
		e.preventDefault();
		this.state.props.isScrolling = true;

		const container = this.elements.container;
		const track = axis === 'x' ? this.elements.trackX : this.elements.trackY;
		if (!container || !track) return;

		const trackRect = track.getBoundingClientRect();
		const startPos = axis === 'x' ? e.clientX : e.clientY;
		const startScroll = axis === 'x' ? container.scrollLeft : container.scrollTop;

		const onMouseMove = (moveE: MouseEvent) => {
			const currentPos = axis === 'x' ? moveE.clientX : moveE.clientY;
			const delta = currentPos - startPos;
			const trackSize = axis === 'x' ? trackRect.width : trackRect.height;

			if (axis === 'x') {
				const maxScrollX = container.scrollWidth - container.clientWidth;
				const scrollDelta = (delta / trackSize) * maxScrollX;
				container.scrollLeft = clamp(startScroll + scrollDelta, 0, maxScrollX);
			} else {
				const maxScrollY = container.scrollHeight - container.clientHeight;
				const scrollDelta = (delta / trackSize) * maxScrollY;
				container.scrollTop = clamp(startScroll + scrollDelta, 0, maxScrollY);
			}
		};

		const onMouseUp = () => {
			this.state.props.isScrolling = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}
}

// Atoms type `this.bond` against the base to reach geometry/drag methods directly.
export const ScrollableBond = defineBond<
	{
		root: typeof ScrollableRootAtom;
		container: typeof ScrollableContainerAtom;
		content: typeof ScrollableContentAtom;
		trackX: typeof ScrollableTrackXAtom;
		trackY: typeof ScrollableTrackYAtom;
		thumbX: typeof ScrollableThumbXAtom;
		thumbY: typeof ScrollableThumbYAtom;
	},
	ScrollableState,
	typeof ScrollableBondBase
>({
	name: 'scrollable',
	base: ScrollableBondBase,
	atoms: {
		root: ScrollableRootAtom,
		container: ScrollableContainerAtom,
		content: ScrollableContentAtom,
		trackX: ScrollableTrackXAtom,
		trackY: ScrollableTrackYAtom,
		thumbX: ScrollableThumbXAtom,
		thumbY: ScrollableThumbYAtom
	}
});

export type ScrollableBond = BondOf<typeof ScrollableBond>;

export class ScrollableState extends BondState<ScrollableBondProps> {
	constructor(props: ScrollableBondProps) {
		super(props);
	}
}
