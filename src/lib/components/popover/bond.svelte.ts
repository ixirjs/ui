import { untrack } from 'svelte';
import { type ComputePositionReturn, type Placement } from '@floating-ui/dom';
import {
	Bond,
	bondContextKey,
	type AtomRegistry,
	type BondVirtualElement
} from '$svelte-atoms/core/shared/bond.svelte';
import { BondAtom, type BondSpec } from '$svelte-atoms/core/shared';
import { focus, getElementId, isBrowser } from '$svelte-atoms/core/utils/dom.svelte';
import {
	OverlayState,
	OverlayTriggerAtom,
	trappedFocus,
	positionedCapabilities,
	type OverlayView,
	type PositionedOverlayElements,
	type OverlayStateProps
} from '$svelte-atoms/core/components/overlay';
import type { PortalBond } from '../portal';
import type { PopoverStrategy } from './strategy-types';

export type PopoverParams = {
	apply?: (
		node: HTMLElement,
		params: { x: number; y: number; dx: number; dy: number; open: boolean; offset: number }
	) => void;

	onchange?: (node: HTMLElement, params: ComputePositionReturn) => void;
};

export type PopoverEngineCleanup = () => void;
export type PopoverEngineParams = Record<string, unknown> & {
	onchange?: (node: HTMLElement, position: ComputePositionReturn) => void;
};
export type PopoverEngine = (
	bond: PopoverBond
) => (props: PopoverEngineParams, ...args: unknown[]) => PopoverEngineCleanup;

export type PopoverContentPropsParams = {
	engine?: 'internal' | PopoverEngine | undefined;
};

export type PopoverStateProps = OverlayStateProps & {
	disabled: boolean;
	placements: Placement[];
	placement: Placement | undefined;
	offset: number;
	portal?: string | PortalBond;
	strategy?: PopoverStrategy;
};

export type TriggerParams = {
	onclick?: (ev: MouseEvent) => void;
};

export type PopoverDomElements = PositionedOverlayElements & {
	trigger?: HTMLElement;
	'virtual-trigger'?: BondVirtualElement;
	overlay?: HTMLElement;
	content?: HTMLElement;
	indicator?: HTMLElement;
	arrow?: HTMLElement;
};

// Positioned defaults (click trigger, escape, restore-to-trigger) + trapped-focus override.
// Shared by PopoverBond constructor and popoverSpec so they never drift.
function popoverCapabilities() {
	return [
		...positionedCapabilities(),
		trappedFocus({ restoreFocus: 'trigger', captureFocusOnOpen: false })
	];
}

// Floating-positioned disclosure with optional arrow/indicator/virtual-trigger.
// Overlay behaviour via capabilities; adds Tab→focus-content and Tab-trap within content.
export class PopoverBond<
	Props extends PopoverStateProps = PopoverStateProps,
	State extends PopoverState<Props> = PopoverState<Props>
> extends Bond<Props, State> {
	static CONTEXT_KEY = bondContextKey('popover');

	static override atoms: AtomRegistry<PopoverBond> = {
		trigger: (b) => new PopoverTriggerAtom(b),
		'virtual-trigger': (b) => new PopoverVirtualTriggerAtom(b),
		overlay: (b) => new PopoverOverlayAtom(b),
		content: (b) => new PopoverContentAtom(b),
		arrow: (b) => new PopoverArrowAtom(b),
		indicator: (b) => new PopoverIndicatorAtom(b)
	};

	// Fusion seam (§13): exposes atoms + capabilities to fuse() via popoverSpec.
	// Getter form avoids the temporal dead zone — popoverSpec is declared below.
	static get spec() {
		return popoverSpec;
	}

	constructor(state: State) {
		super(state, 'popover');
		// Overlay behaviour via capabilities (§13). Subclasses customize by re-registering a
		// slot last-wins (dropdown-menu/select → trigger ariaHasPopup, combobox → escape).
		for (const cap of popoverCapabilities()) this.capability(cap);
	}

	// Disclosure verbs — delegate to OverlayState (kept so callers of bond.open/close/toggle work).
	open(): void {
		this.state.open();
	}
	close(): void {
		this.state.close();
	}
	toggle(): void {
		this.state.toggle();
	}
}

export class PopoverState<
	Props extends PopoverStateProps = PopoverStateProps
> extends OverlayState<Props> {
	position = $state<ComputePositionReturn>();
	// Whether position should be actively computed. Defaults to `open`; can be overridden
	// to keep computing while hiding or to start computing on hover before open.
	tracking = $state<boolean | undefined>(undefined);

	#computedResolve!: (position: ComputePositionReturn) => void;
	// Resolves with the next computed position; renewed after each resolution.
	computed: Promise<ComputePositionReturn> = this.#createComputed();

	#createComputed() {
		return new Promise<ComputePositionReturn>((resolve) => {
			this.#computedResolve = resolve;
		});
	}

	// Notify awaiters of a fresh computation and renew the promise.
	notifyComputed(position: ComputePositionReturn) {
		this.position = position;
		this.#computedResolve(position);
		this.computed = this.#createComputed();
	}

	get shouldTrackPosition() {
		return this.tracking ?? this.isOpen;
	}
}

export class PopoverArrowAtom<B extends OverlayView = PopoverBond> extends BondAtom<B, HTMLElement> {
	constructor(bond: B) {
		super(bond, 'arrow');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'presentation',
			'aria-hidden': true
		};
	}
}

export class PopoverVirtualTriggerAtom<B extends OverlayView = PopoverBond> extends BondAtom<B, BondVirtualElement> {
	constructor(bond: B) {
		super(bond, 'virtual-trigger');
	}

	override get attrs() {
		return {};
	}

	override get handlers() {
		return {};
	}

	override get attachments() {
		return {};
	}

	override get spread() {
		return {};
	}

	override get element() {
		return super.element;
	}

	override set element(element: BondVirtualElement | undefined) {
		this.setElement(element);
	}
}

// Overlay container atom — owns the dialog ARIA contract and the focus-trap/escape
// capabilities via `.role('surface')`.
export class PopoverOverlayAtom<B extends OverlayView = PopoverBond> extends BondAtom<B, HTMLElement> {
	constructor(bond: B) {
		super(bond, 'overlay');
		this.role('surface');
	}

	override get attrs() {
		// Label the dialog by the trigger, not itself (a self-reference is meaningless).
		const triggerId = getElementId(this.bond.id, `${this.bond.namespace}-trigger`);
		const isOpen = this.bond.state.isOpen;
		const isDisabled = this.bond.state.isDisabled;
		const isActive = isOpen && !isDisabled;

		return {
			...super.attrs,
			role: 'dialog',
			'aria-modal': false,
			'aria-labelledby': triggerId,
			inert: !isActive ? true : undefined,
			tabindex: -1,
			'data-active': isActive
		};
	}

	// No hand-written handlers: focus-trap + escape onkeydown come from `.role('surface')`.

	override onmount(node: HTMLElement) {
		const triggerElement = this.bond.element<Element>('trigger');
		if (!triggerElement) return;

		const isOpen = untrack(() => this.bond.state.isOpen);
		if (!isOpen) return;

		// Avoid stealing focus from inputs/textareas inside trigger
		const activeElement = document.activeElement as HTMLElement;
		const triggerContainsFocus =
			['input', 'textarea'].includes(activeElement.tagName.toLowerCase()) &&
			triggerElement.contains(activeElement);

		if (!triggerContainsFocus) {
			setTimeout(() => focus(node, ['textarea:not([disabled])', 'input:not([disabled])']), 0);
		}
	}
}

export class PopoverContentAtom<B extends OverlayView = PopoverBond> extends BondAtom<B, HTMLElement> {
	constructor(bond: B) {
		super(bond, 'content');
	}

	override get attrs() {
		const isOpen = this.bond.state.isOpen;
		const isDisabled = this.bond.state.isDisabled;
		const isActive = isOpen && !isDisabled;
		return {
			...super.attrs,
			'data-active': isActive
		};
	}

	override get handlers() {
		return {};
	}
}

export class PopoverIndicatorAtom<B extends OverlayView = PopoverBond> extends BondAtom<B, HTMLElement> {
	constructor(bond: B) {
		super(bond, 'indicator');
	}

	override get attrs() {
		const isOpen = this.bond.state.isOpen;
		return {
			...super.attrs,
			'aria-hidden': true,
			'aria-live': isOpen ? ('polite' as const) : ('off' as const)
		};
	}
}

// Extends OverlayTriggerAtom with role="button" (non-button), disabled attr (button),
// Tab→focus-content, and Escape→close routing.
export class PopoverTriggerAtom<B extends OverlayView = PopoverBond> extends OverlayTriggerAtom<B> {
	override get attrs() {
		const isButtonElement = isBrowser() ? this.element instanceof HTMLButtonElement : false;
		const isDisabled = this.bond.state.isDisabled;
		return {
			...super.attrs,
			role: isButtonElement ? '' : 'button',
			disabled: isButtonElement ? isDisabled : undefined
		};
	}

	override get handlers() {
		const baseHandlers = super.handlers as {
			onclick?: (ev: MouseEvent) => void;
			onkeydown?: (ev: KeyboardEvent) => void;
		};

		return {
			...baseHandlers,
			onkeydown: (ev: KeyboardEvent) => {
				if (this.bond.state.isDisabled) return;

				if (ev.key === 'Tab') {
					this.bond.element<HTMLElement>('content')?.focus();
					return;
				}

				if (ev.key === 'Escape') {
					// Trigger holds focus (not trapped in content): Escape still closes.
					this.bond.state.close();
					return;
				}

				baseHandlers.onkeydown?.(ev);
			}
		} as Record<string, unknown>;
	}
}

// Fusion spec (§9.4.1): exposes popover's atoms + capabilities to fuse() without
// converting the generic PopoverBond to a defineBond. Pass as `{ spec: popoverSpec }`.
export const popoverSpec: BondSpec<{
	trigger: typeof PopoverTriggerAtom;
	'virtual-trigger': typeof PopoverVirtualTriggerAtom;
	overlay: typeof PopoverOverlayAtom;
	content: typeof PopoverContentAtom;
	arrow: typeof PopoverArrowAtom;
	indicator: typeof PopoverIndicatorAtom;
}> = {
	name: 'popover',
	atoms: {
		trigger: PopoverTriggerAtom,
		'virtual-trigger': PopoverVirtualTriggerAtom,
		overlay: PopoverOverlayAtom,
		content: PopoverContentAtom,
		arrow: PopoverArrowAtom,
		indicator: PopoverIndicatorAtom
	},
	capabilities: popoverCapabilities
};
