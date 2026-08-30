/**
 * Toast's shared object — a plain state class on the redesigned `Kernel`. The disclosure model
 * stays `createDisclosure`; the live-region and labelling ARIA it used to project are written in
 * the root's `attrs`, the title/description hand the root their ids at init, and the timeout is
 * one effect here.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { createDisclosure, type Disclosure } from '$ixirjs/ui/capability/models/disclosure.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type ToastBondProps = {
	id?: string;
	open: boolean;
	disabled: boolean;
	dismissible?: boolean;
	duration?: number;
};

export const ToastContext = Kernel.context<ToastBond>('bond/toast');

export class ToastBond {
	readonly name = 'toast';
	readonly props: ToastBondProps;
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;
	// Storage stays in props.open.
	readonly disclosure: Disclosure;
	/** The Title's element id, once one has rendered. */
	titleId = $state<string | undefined>();
	/** The Description's element id, once one has rendered. */
	descriptionId = $state<string | undefined>();

	constructor(props: ToastBondProps) {
		this.props = props;
		this.disclosure = createDisclosure({
			get: () => this.props.open,
			set: (v) => (this.props.open = v)
		});
		// Closes an open toast after its configured duration.
		$effect(() => {
			const duration = this.props.duration ?? 0;
			if (!this.isOpen || duration <= 0) return;
			const handle = setTimeout(() => {
				this.stageOpenChange({ reason: 'timeout' });
				this.close();
			}, duration);
			return () => clearTimeout(handle);
		});
	}

	static create(props: ToastBondProps): ToastBond {
		return new ToastBond(props);
	}

	get id(): string {
		return this.props.id ?? 'toast';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'toast-root');
	}
	get closeId(): string {
		return Kernel.id(this.id, 'toast-close');
	}

	stageOpenChange(context: Pick<StateChangeContext, 'event' | 'reason'>): void {
		this.#openChangeContext = context;
		queueMicrotask(() => {
			if (this.#openChangeContext === context) this.#openChangeContext = undefined;
		});
	}

	takeOpenChangeContext(): Pick<StateChangeContext, 'event' | 'reason'> {
		const context = this.#openChangeContext ?? {};
		this.#openChangeContext = undefined;
		return context;
	}

	get isOpen(): boolean {
		return this.disclosure.isOpen;
	}

	get isDisabled() {
		return this.props.disabled;
	}

	// `disabled` is the bond's own guard, layered around the shared disclosure.
	open() {
		if (this.props.disabled) return;
		this.disclosure.open();
	}

	close() {
		this.disclosure.close();
	}

	toggle() {
		if (this.props.disabled) return;
		this.disclosure.toggle();
	}
}
