import { Bond, Atom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { clamp } from '$ixirjs/ui/utils/math';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class ScrollableRootAtom extends Atom<ScrollableBondBase> {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'root');
	}

	override get attrs() {
		const props = this.requireBond().props;

		return {
			...super.attrs,
			'data-disabled': props.disabled,
			'data-open': props.open
		};
	}
}

export class ScrollableContainerAtom extends Atom<ScrollableBondBase> {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'container');
	}

	override get handlers() {
		return {
			onscroll: () => {
				this.requireBond().updateScrollState();
			}
		};
	}

	override onmount() {
		let mounted = true;
		queueMicrotask(() => {
			if (mounted) this.requireBond().updateScrollState();
		});
		return () => {
			mounted = false;
		};
	}
}

export class ScrollableContentAtom extends Atom<ScrollableBondBase> {
	constructor(bond: ScrollableBondBase) {
		super(bond, 'content');
	}
}

// Track atom; axis fixed at construction.
export class ScrollableTrackAtom extends Atom<ScrollableBondBase> {
	#axis: 'x' | 'y';

	constructor(bond: ScrollableBondBase, axis: 'x' | 'y') {
		super(bond, axis === 'x' ? 'trackX' : 'trackY');
		this.#axis = axis;
	}

	override get attrs() {
		const canScroll =
			this.#axis === 'x' ? this.requireBond().canScrollX : this.requireBond().canScrollY;

		return {
			...super.attrs,
			'data-visible': canScroll,
			'data-direction': this.#axis === 'x' ? 'horizontal' : 'vertical'
		};
	}

	override get handlers() {
		return {
			onclick: (e: MouseEvent) => {
				this.requireBond().handleTrackClick(e, this.#axis);
			}
		};
	}
}

// Thumb atom; axis fixed at construction.
export class ScrollableThumbAtom extends Atom<ScrollableBondBase> {
	#axis: 'x' | 'y';

	constructor(bond: ScrollableBondBase, axis: 'x' | 'y') {
		super(bond, axis === 'x' ? 'thumbX' : 'thumbY');
		this.#axis = axis;
	}

	override get attrs() {
		const position =
			this.#axis === 'x'
				? this.requireBond().getThumbXPosition()
				: this.requireBond().getThumbYPosition();
		const size =
			this.#axis === 'x' ? this.requireBond().getThumbXSize() : this.requireBond().getThumbYSize();

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
				this.requireBond().handleThumbDrag(e, this.#axis);
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

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class ScrollableBondBase extends Bond<ScrollableBondProps> {
	#parent: ScrollableBond | undefined;

	constructor(props: ScrollableBondProps, name = 'scrollable') {
		super(props, name);
		this.#parent = ScrollableBond.get();
	}

	get parent() {
		return this.#parent;
	}

	// Narrows the inherited element registry to concrete HTMLElements (hides VirtualElement).
	override get elements(): Partial<ScrollableBondElements> &
		Record<string, HTMLElement | undefined> {
		return super.elements as Partial<ScrollableBondElements> &
			Record<string, HTMLElement | undefined>;
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
		this.props.isScrolling = true;

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
			this.props.isScrolling = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}
}

// Atoms type `this.bond` against the base to reach geometry/drag methods directly.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const ScrollableBond = defineBond({
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
