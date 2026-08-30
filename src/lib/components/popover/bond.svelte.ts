/**
 * Popover's shared object on the redesigned `Kernel` — a plain state class over the overlay core.
 *
 * `PopoverBondBase` is what the menu families extend (`DropdownMenuBondBase extends PopoverBondBase`);
 * `PopoverBond` is the family's own. Both keep their names and the position API the strategies and
 * the tail read: `position`, `tracking`, `computed`, `notifyComputed`, `shouldTrackPosition`.
 * Behaviour is the overlay core's functions (`triggerAttrs`, `clickTrigger`, `usePositioned`,
 * `useOutsidePress`), written literally by each part; the parts announce their ids with
 * `attachPart` so `element('trigger')` and `partId('content')` resolve without a registry.
 */
import type { ComputePositionReturn, Placement, VirtualElement } from '@floating-ui/dom';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	OverlayBond,
	type OverlayLike,
	type OverlayProps
} from '$ixirjs/ui/components/overlay/model.svelte';
import type { DismissPressEvent } from '$ixirjs/ui/components/overlay/behavior.svelte';
import { closeOnEscape } from '$ixirjs/ui/components/overlay/behavior.svelte';
import type { PortalBond } from '$ixirjs/ui/components/portal';
import type { PopoverStrategy } from './strategy-types';
import type { PopoverPresets } from './types';

export type PopoverParams = {
	apply?: (
		node: HTMLElement,
		params: { x: number; y: number; dx: number; dy: number; open: boolean; offset: number }
	) => void;

	onpositionchange?: (node: HTMLElement, params: ComputePositionReturn) => void;
};

export type PopoverBondProps = OverlayProps & {
	placements: Placement[];
	placement: Placement | undefined;
	offset: number;
	// CSS positioning strategy for the floating content. Set explicitly by the consumer;
	// always authoritative (a host overlay no longer forces it). Defaults to 'absolute'.
	position: 'fixed' | 'absolute';
	portal?: string | PortalBond | undefined;
	strategy?: PopoverStrategy | undefined;
	presets?: PopoverPresets | undefined;
};

export type PopoverStateProps = PopoverBondProps;

export type TriggerParams = {
	onclick?: (ev: MouseEvent) => void;
};

export const PopoverContext = Kernel.context<PopoverBond>('bond/popover');

// Floating-positioned disclosure with optional tail/indicator. The root wires the positioned
// overlay behaviour (`usePositioned`, `useOutsidePress`); the parts write its projections.
export class PopoverBondBase<
	Props extends PopoverBondProps = PopoverBondProps
> extends OverlayBond<Props> {
	position = $state<ComputePositionReturn>();
	// Whether position should be actively computed. Defaults to `open`; can be overridden
	// to keep computing while hiding or to start computing on hover before open.
	tracking = $state<boolean | undefined>(undefined);
	/** The Content's `onclickoutside`, handed to the root's outside-press dismissal while mounted. */
	// The bond parameter is widened away from `this`: a `this`-typed member makes every subclass
	// with members of its own un-assignable to `PopoverBondBase`, which every overlay behaviour takes.
	onclickoutside: ((event: DismissPressEvent, bond: PopoverBondBase) => void) | undefined;

	#computedResolve!: (position: ComputePositionReturn) => void;
	// Resolves with the next computed position; renewed after each resolution.
	computed: Promise<ComputePositionReturn> = this.#createComputed();

	constructor(props: Props, name = 'popover') {
		super(props, name);
	}

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

	/**
	 * The floating anchor. `element('trigger')` for every ordinary popover; ContextMenu overrides it
	 * with the virtual element it builds from the pointer position.
	 */
	get reference(): Element | VirtualElement | null {
		return this.element('trigger');
	}

	/**
	 * What Escape does on this overlay's surface. One seam so every family routes through it —
	 * Select and Combobox override it to clear the filter query before the second Escape closes.
	 */
	onEscape(event: KeyboardEvent): void {
		closeOnEscape(this, event);
	}
}

export class PopoverBond extends PopoverBondBase {
	// The second overload only keeps the static side compatible with `OverlayBond.create(outer?)`,
	// the host-delegating constructor this family never calls.
	static override create(props: PopoverBondProps): PopoverBond;
	static override create(outer?: OverlayLike): OverlayBond;
	static override create(props?: PopoverBondProps | OverlayLike): OverlayBond {
		return new PopoverBond(props as PopoverBondProps);
	}
}

// ─── Legacy shims ──────────────────────────────────────────────────────────────────────────────
// The old-runtime Popover (`./legacy/**`) still serves DropdownMenu, Select, Combobox, ContextMenu
// and DatePicker, and `@ixirjs/ui/experimental` publishes its Atom names. Re-exported here so those
// names keep resolving from this module; delete with `./legacy` when the last of them migrates.
// `createPopoverAtom` lives here rather than in `legacy/` only because this is the one popover file
// allowed to reach `bond/declaration` (see `kernel-authoring-audit.spec.ts`).
