import { StepperBond, type IStepper } from '../bond.svelte';
import { BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';

// Bond shape the step atoms type `this.bond` against — breaks the atom↔bond cycle.
type StepBondView = ViewOf<StepBondState>;

export type StepBondProps = BondStateProps & {
	index: number;
	disabled: boolean;
	completed: boolean;
	optional?: boolean;
	error: boolean;
};

export type StepBondElements = {
	root: HTMLElement;
	indicator: HTMLElement;
	header: HTMLElement;
	title: HTMLElement;
	description: HTMLElement;
	body?: HTMLElement;
	separator?: HTMLElement;
};

class StepRootAtom extends BondAtom<StepBondView, HTMLElement> {
	constructor(bond: StepBondView) {
		super(bond, 'root');
	}
	override get attrs() {
		const bond = this.bond;
		const state = bond.state;

		const props = bond.state.props;

		return {
			...super.attrs,
			'data-stepper': state?.parent?.id ?? '',
			'data-index': props.index ?? 0,
			'data-active': state?.isActive,
			'data-completed': state?.isCompleted,
			'data-disabled': state?.isDisabled,
			'data-error': props.error,
			'aria-disabled': state?.isDisabled,
			'aria-describedby': `step-description-${bond.id}`,
			'aria-labelledby': `step-title-${bond.id}`,
			role: 'group' as const
		};
	}
}

class StepIndicatorAtom extends BondAtom<StepBondView, HTMLElement> {
	constructor(bond: StepBondView) {
		super(bond, 'indicator');
	}
	override get attrs() {
		const state = this.bond.state;
		const props = this.bond.state.props;

		return {
			...super.attrs,
			'aria-current': state?.isActive ? ('step' as const) : undefined,
			'data-active': state?.isActive,
			'data-completed': state?.isCompleted,
			'data-disabled': state?.isDisabled,
			'data-error': props.error,
			role: 'presentation' as const
		};
	}
}

class StepHeaderAtom extends BondAtom<StepBondView, HTMLElement> {
	constructor(bond: StepBondView) {
		super(bond, 'header');
	}
	override get attrs() {
		const bond = this.bond;
		const state = bond.state;
		const props = bond.state.props;

		return {
			...super.attrs,
			'data-active': state?.isActive,
			'data-completed': state?.isCompleted,
			'data-disabled': state?.isDisabled,
			'data-error': props.error
		};
	}
}

class StepTitleAtom extends BondAtom<StepBondView, HTMLElement> {
	constructor(bond: StepBondView) {
		super(bond, 'title');
	}
	override get attrs() {
		return {
			...super.attrs
		};
	}
}

class StepDescriptionAtom extends BondAtom<StepBondView, HTMLElement> {
	constructor(bond: StepBondView) {
		super(bond, 'description');
	}
	override get attrs() {
		return {
			...super.attrs
		};
	}
}

class StepBodyAtom extends BondAtom<StepBondView, HTMLElement> {
	constructor(bond: StepBondView) {
		super(bond, 'body');
	}
	override get attrs() {
		const bond = this.bond;
		const state = bond.state;
		const props = bond.state.props;

		return {
			...super.attrs,
			'data-active': state?.isActive,
			'data-completed': state?.isCompleted,
			'data-disabled': state?.isDisabled,
			'data-error': props.error
		};
	}
}

class StepSeparatorAtom extends BondAtom<StepBondView, HTMLElement> {
	constructor(bond: StepBondView) {
		super(bond, 'separator');
	}
	override get attrs() {
		const state = this.bond.state;
		const props = this.bond.state.props;

		return {
			...super.attrs,
			'aria-hidden': 'true',
			role: 'presentation' as const,
			'data-active': state?.isActive,
			'data-completed': state?.isCompleted,
			'data-disabled': state?.isDisabled,
			'data-error': props.error
		};
	}
}

// StepBond — `defineBond` (§6). `preset` is the dotted path (`stepper.step`), distinct
// from the DOM namespace (`step`); parent wiring lives on StepBondState.
export const StepBond = defineBond<
	{
		root: typeof StepRootAtom;
		indicator: typeof StepIndicatorAtom;
		header: typeof StepHeaderAtom;
		title: typeof StepTitleAtom;
		description: typeof StepDescriptionAtom;
		body: typeof StepBodyAtom;
		separator: typeof StepSeparatorAtom;
	},
	StepBondState
>({
	name: 'step',
	preset: 'stepper.step',
	atoms: {
		root: StepRootAtom,
		indicator: StepIndicatorAtom,
		header: StepHeaderAtom,
		title: StepTitleAtom,
		description: StepDescriptionAtom,
		body: StepBodyAtom,
		separator: StepSeparatorAtom
	}
});

// Instance type of the step bond — paired with the `const` above.
export type StepBond = BondOf<typeof StepBond>;

export class StepBondState extends BondState<StepBondProps> {
	// Narrow parent contract (not the whole StepperState).
	#parent?: IStepper;

	constructor(props: StepBondProps) {
		super(props);
		const stepperBond = StepperBond.get();
		if (!stepperBond) {
			throw new Error('Step must be used within a Stepper context.');
		}
		this.#parent = stepperBond.state;
	}

	get isActive() {
		return this.#parent?.activeStep === this.props.index;
	}

	get isCompleted() {
		const activeStep = this.#parent?.activeStep;
		return (
			this.props.completed || (typeof activeStep === 'number' && activeStep > this.props.index)
		);
	}

	get isDisabled() {
		return (
			this.props.disabled ||
			(this.#parent?.linear && this.props.index > this.#parent.activeStep + 1)
		);
	}

	// The narrow parent contract this step depends on.
	get parent() {
		return this.#parent;
	}

	mount() {
		this.#parent?.mountStep(this.props.index, {} as StepBond);
		return this.unmount;
	}

	unmount = () => {
		this.#parent?.unmountStep(this.props.index);
	};

	activate() {
		if (!this.isDisabled) {
			this.#parent?.goto(this.props.index);
		}
	}
}
