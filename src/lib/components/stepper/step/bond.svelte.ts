/**
 * A step's shared object. Registered with the stepper at the root's init (document order); the
 * header's labelling is the title/description writing their ids here at their init.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { StepperContext, type IStepper } from '$ixirjs/ui/components/stepper/bond.svelte';

export type StepBondProps = {
	id?: string;
	index: number;
	disabled: boolean;
	completed: boolean;
	optional?: boolean;
	error?: boolean;
};

export const StepContext = Kernel.context<StepBond>('bond/step');

export class StepBond {
	readonly name = 'step';
	readonly props: StepBondProps;
	readonly #parent: IStepper;
	/** The Title's element id, once one has rendered. */
	titleId = $state<string | undefined>();
	/** The Description's element id, once one has rendered. */
	descriptionId = $state<string | undefined>();

	constructor(props: StepBondProps, parent?: IStepper) {
		this.props = props;
		const resolved = parent ?? StepperContext.get();
		if (!resolved) throw new Error('Step must be used within a Stepper context.');
		this.#parent = resolved;
	}

	static create(props: StepBondProps): StepBond {
		return new StepBond(props);
	}

	get id(): string {
		return this.props.id ?? 'step';
	}
	/** The id a part renders: `step-<part>-<seed>`. */
	partId(part: string): string {
		return Kernel.id(this.id, `step-${part}`);
	}

	get isActive() {
		return this.#parent.activeStep === this.props.index;
	}

	get isCompleted() {
		const activeStep = this.#parent.activeStep;
		return (
			this.props.completed || (typeof activeStep === 'number' && activeStep > this.props.index)
		);
	}

	get isDisabled() {
		return (
			this.props.disabled || (this.#parent.linear && this.props.index > this.#parent.activeStep + 1)
		);
	}

	get parent() {
		return this.#parent;
	}

	/** The `data-*` status every rendered part carries. */
	get statusAttrs() {
		return {
			'data-active': this.isActive,
			'data-completed': this.isCompleted,
			'data-disabled': this.isDisabled,
			'data-error': this.props.error
		};
	}

	mount(step: StepBond) {
		return this.#parent.mountStep(this.props.index, step);
	}

	unmount = () => {
		this.#parent.unmountStep(this.props.index);
	};

	activate() {
		if (!this.isDisabled) {
			this.#parent.goto(this.props.index);
		}
	}
}
