/**
 * Alert's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ alert }` in snippets, `getBond`, `factory`,
 * `AlertBond.create`) and none of the runtime: no capability registry, no node registry, no Atoms.
 * The live region the alert projects (`role="alert"`, which already implies assertive + atomic) and
 * the ids its Title and Description render are written literally by the parts.
 * `docs/research/whiteboard-2026-08.md`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';

export type AlertBondProps = {
	id?: string | undefined;
	disabled?: boolean | undefined;
	extend?: Record<string, unknown> | undefined;
};

export const AlertContext = Kernel.context<AlertBond>('bond/alert');

export class AlertBond {
	readonly name = 'alert';
	readonly props: AlertBondProps;

	constructor(props: AlertBondProps = {}) {
		this.props = props;
	}

	static create(props: AlertBondProps = {}): AlertBond {
		return new AlertBond(props);
	}

	/** The family's identity seed — the root's `$props.id()`. */
	get id(): string {
		return this.props.id ?? 'alert';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'alert-root');
	}
	get iconId(): string {
		return Kernel.id(this.id, 'alert-icon');
	}
	get titleId(): string {
		return Kernel.id(this.id, 'alert-title');
	}
	get descriptionId(): string {
		return Kernel.id(this.id, 'alert-description');
	}
	get closeId(): string {
		return Kernel.id(this.id, 'alert-close');
	}
	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}
	/** The root element, by the id it renders. */
	get element(): HTMLElement | undefined {
		return typeof document === 'undefined'
			? undefined
			: (document.getElementById(this.rootId) ?? undefined);
	}
}
