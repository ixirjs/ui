import { Bond, Atom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	thumbDragPolicy,
	trackPressPolicy
} from '$ixirjs/ui/shared/capability/models/interaction-policies/pointer.svelte';
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
		// The axis is the role context: one trackPressPolicy serves both scrollbars.
		this.role('track', axis);
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
}

// Thumb atom; axis fixed at construction.
export class ScrollableThumbAtom extends Atom<ScrollableBondBase> {
	#axis: 'x' | 'y';

	constructor(bond: ScrollableBondBase, axis: 'x' | 'y') {
		super(bond, axis === 'x' ? 'thumbX' : 'thumbY');
		this.#axis = axis;
		this.role('thumb', axis);
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
	#dragOrigin = 0;

	constructor(props: ScrollableBondProps, name = 'scrollable') {
		super(props, name);
		this.#parent = ScrollableBond.get();

		// Both scrollbars project the same role with their axis as context, so one descriptor per
		// slot serves both. Pointer events (not mouse) come with capture and cancel handling, which
		// the previous hand-rolled document listeners had neither of.
		this.registerCapabilities([
			trackPressPolicy({
				disabled: (bond) => (bond as ScrollableBondBase).props.disabled,
				onPress: (detail, bond, _event, axis) => {
					const owner = bond as ScrollableBondBase;
					owner.scrollToTrackFraction(
						axis as 'x' | 'y',
						axis === 'x' ? detail.percentX : detail.percentY
					);
				}
			}),
			thumbDragPolicy({
				disabled: (bond) => (bond as ScrollableBondBase).props.disabled,
				onStart: (_detail, bond, _event, axis) =>
					(bond as ScrollableBondBase).beginThumbDrag(axis as 'x' | 'y'),
				onDrag: (detail, bond, _event, axis) =>
					(bond as ScrollableBondBase).dragThumbBy(
						axis as 'x' | 'y',
						axis === 'x' ? detail.deltaX : detail.deltaY
					),
				onEnd: (_detail, bond) => (bond as ScrollableBondBase).endThumbDrag()
			})
		]);
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

	/** Max scroll distance on one axis; 0 when that axis does not overflow. */
	#maxScroll(axis: 'x' | 'y'): number {
		const container = this.elements.container;
		if (!container) return 0;
		return axis === 'x'
			? container.scrollWidth - container.clientWidth
			: container.scrollHeight - container.clientHeight;
	}

	/** Jump to the pressed fraction of the track. `percent` comes from the track press policy. */
	scrollToTrackFraction(axis: 'x' | 'y', percent: number) {
		const container = this.elements.container;
		if (!container) return;
		const target = (percent / 100) * this.#maxScroll(axis);
		if (axis === 'x') container.scrollLeft = target;
		else container.scrollTop = target;
	}

	beginThumbDrag(axis: 'x' | 'y') {
		const container = this.elements.container;
		// Stage `isScrolling` only once the drag can actually run, so a press with no container
		// cannot leave the scrollbars pinned visible.
		if (!container) return;
		this.#dragOrigin = axis === 'x' ? container.scrollLeft : container.scrollTop;
		this.props.isScrolling = true;
	}

	dragThumbBy(axis: 'x' | 'y', delta: number) {
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
