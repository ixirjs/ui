import type { StepBond } from './step/bond.svelte';
import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import { ariaRole } from '$svelte-atoms/core/shared/capability';
import type { Snippet } from 'svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type StepperBondProps = BondStateProps & {
	step: number;
	linear?: boolean;
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
};

export type StepperElements = {
	root: HTMLElement;
};

export type StepContentSnippet = {
	props: Record<string, unknown>;
	children: Snippet<[{ step: StepBond }]>;
};

// Narrow parent contract a StepBond child depends on, not the whole StepperBond.
export interface IStepper {
	readonly id: string;
	readonly activeStep: number;
	readonly linear: boolean;
	mountStep(index: number, step: StepBond): () => void;
	unmountStep(index: number): void;
	goto(index: number): void;
}

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type StepperBondView = StepperBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const StepperRootAtom = defineAtom<StepperBondView>('root', (atom) => {
	atom.capability(ariaRole('group'));
});
export type StepperRootAtom = InstanceType<typeof StepperRootAtom>;

// Stepper orchestration lives on the Bond instance.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class StepperBondBase extends Bond<StepperBondProps> implements IStepper {
	constructor(props: StepperBondProps, name = 'stepper') {
		super(props, name);
		// Eagerly create owned collections outside derived reads; collection() registers a capability.
		void this.steps;
		void this.stepContents;
	}

	get steps() {
		return this.collection<StepBond>('step');
	}

	get stepContents() {
		return this.collection<{
			props: Record<string, unknown>;
			children: Snippet<[{ step: StepBond }]>;
		}>('content');
	}

	get activeStep() {
		return this.props.step;
	}

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

	goto(index: number) {
		this.navigation.goto(index);
	}

	mountStep(index: number, step: StepBond) {
		return this.steps.set(String(index), step);
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
		return this.stepContents.set(String(index), { props, children });
	}

	unregisterStepContent(index: number) {
		this.stepContents.delete(String(index));
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const StepperBondImpl = defineBond<
	{ root: typeof StepperRootAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof StepperBondBase
>({
	name: 'stepper',
	base: StepperBondBase,
	atoms: { root: StepperRootAtom }
});

export type StepperBond = BondOf<typeof StepperBondImpl>;

interface StepperBondConstructor {
	new (props: StepperBondProps): StepperBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof StepperBondImpl)['spec'];
	get(): StepperBond | undefined;
	getOrThrow(message?: string): StepperBond;
	set(bond: StepperBond): StepperBond;
	create(props: StepperBondProps): StepperBond;
}

export const StepperBond = StepperBondImpl as unknown as StepperBondConstructor;
