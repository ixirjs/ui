import type { StepBond } from './step/bond.svelte';
import { BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import type { Snippet } from 'svelte';

export type StepperStateProps = BondStateProps & {
	step: number;
	linear?: boolean;
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	readonly rest?: Record<string, unknown>;
};

export type StepperElements = {
	root: HTMLElement;
};

export type StepContentSnippet = {
	props: Record<string, unknown>;
	children: Snippet<[{ step: StepBond }]>;
};

// Narrow parent contract a StepBond child depends on — not the whole StepperState.
// StepperState implements IStepper; the child holds this interface (stubbable, locality-preserving).
export interface IStepper {
	// The parent stepper's id (for `data-stepper` cross-reference).
	readonly id: string;
	// The active step index (`props.step`).
	readonly activeStep: number;
	// Linear mode — only adjacent forward navigation is allowed.
	readonly linear: boolean;
	mountStep(index: number, step: StepBond): () => void;
	unmountStep(index: number): void;
	goto(index: number): void;
}

// Bond shape the stepper atoms type `this.bond` against — breaks the atom↔bond cycle.
type StepperBondView = ViewOf<StepperState>;

export class StepperRootAtom extends BondAtom<StepperBondView> {
	constructor(bond: StepperBondView) {
		super(bond, 'root');
	}
	override get attrs() {
		return {
			...super.attrs,
			role: 'group' as const
		};
	}
}

// StepperBond — `defineBond` (§6). Step orchestration lives on {@link StepperState}.
export const StepperBond = defineBond<{ root: typeof StepperRootAtom }, StepperState>({
	name: 'stepper',
	atoms: { root: StepperRootAtom }
});

// Instance type of the stepper bond — paired with the `const` above.
export type StepperBond = BondOf<typeof StepperBond>;

export class StepperState extends BondState<StepperStateProps> implements IStepper {
	// Kind-cached Collections keyed by String(index). `totalSteps` = collection size (reactive).
	get steps() {
		return this.collection<StepBond>('step');
	}

	get stepContents() {
		return this.collection<{
			props: Record<string, unknown>;
			children: Snippet<[{ step: StepBond }]>;
		}>('content');
	}

	constructor(props: StepperStateProps) {
		super(props);
	}

	get activeStep() {
		return this.props.step;
	}

	// Linear mode — part of the {@link IStepper} child contract.
	get linear() {
		return this.props.linear ?? false;
	}

	get totalSteps() {
		return this.steps.size;
	}

	get isFirstStep() {
		return this.props.step === 0;
	}

	get isLastStep() {
		return this.props.step === this.totalSteps - 1;
	}

	get activeStepContent() {
		return this.stepContents.get(String(this.props.step));
	}

	get navigation() {
		return {
			next: () => {
				if (!this.isLastStep) {
					this.props.step = this.props.step + 1;
				}
			},
			previous: () => {
				if (!this.isFirstStep) {
					this.props.step = this.props.step - 1;
				}
			},
			reset: () => {
				this.props.step = 0;
			},
			goto: (step: number) => {
				if (step >= 0 && step < this.totalSteps) {
					// In linear mode, only allow going to previous steps or next immediate step
					if (this.props.linear) {
						if (step <= this.props.step + 1) {
							this.props.step = step;
						}
					} else {
						this.props.step = step;
					}
				}
			}
		};
	}

	// Flat alias of `navigation.goto` — the {@link IStepper} child contract.
	goto(index: number) {
		this.navigation.goto(index);
	}

	mountStep(index: number, step: StepBond) {
		return this.steps.attach(String(index), step);
	}

	unmountStep(index: number) {
		this.steps.delete(String(index));
	}

	getStep(index: number) {
		return this.steps.get(String(index));
	}

	registerStepContent(
		index: number,
		props: Record<string, unknown>,
		children: Snippet<[{ step: StepBond }]>
	) {
		return this.stepContents.attach(String(index), { props, children });
	}

	unregisterStepContent(index: number) {
		this.stepContents.delete(String(index));
	}
}
