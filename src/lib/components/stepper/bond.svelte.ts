/**
 * Stepper's shared object — a plain state class on the redesigned `Kernel`. Steps register at
 * their root's init in document order; step bodies register their content for `Stepper.Content`.
 */
import type { Snippet } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { StepBond } from './step/bond.svelte';

export type StepperBondProps = {
	id?: string;
	step: number;
	linear?: boolean;
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
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

export const StepperContext = Kernel.context<StepperBond>('bond/stepper');

export class StepperBond implements IStepper {
	readonly name = 'stepper';
	readonly props: StepperBondProps;
	/** Mounted steps in document order, keyed by index. */
	readonly items = new Map<string, StepBond>();
	/** Registered step bodies, rendered by `Stepper.Content`. */
	readonly stepContents = new SvelteMap<string, StepContentSnippet>();
	/** `items.size`, as one equality-gated reactive fact. */
	#count = $state(0);

	constructor(props: StepperBondProps) {
		this.props = props;
	}

	static create(props: StepperBondProps): StepperBond {
		return new StepperBond(props);
	}

	get id(): string {
		return this.props.id ?? 'stepper';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'stepper-root');
	}

	get steps() {
		return this.items;
	}

	get activeStep() {
		return this.props.step;
	}

	get linear() {
		return this.props.linear ?? false;
	}

	get totalSteps() {
		return this.#count;
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
		const key = String(index);
		this.items.set(key, step);
		this.#count = this.items.size;
		return () => this.unmountStep(index);
	}

	unmountStep(index: number) {
		this.items.delete(String(index));
		this.#count = this.items.size;
	}

	getStep(index: number) {
		return this.items.get(String(index));
	}

	registerStepContent(
		index: number,
		props: Record<string, unknown>,
		children: Snippet<[{ step: StepBond }]>
	) {
		this.stepContents.set(String(index), { props, children });
		return () => this.unregisterStepContent(index);
	}

	unregisterStepContent(index: number) {
		this.stepContents.delete(String(index));
	}
}
