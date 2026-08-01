export type BondContext<B> = {
	get(): B | undefined;
};

export type BondAttachmentCallback<B, R = void | (() => void)> = (
	node: HTMLElement,
	bond: B | undefined
) => R;

export type BondAttachment<B> = <R = void | (() => void)>(
	callback: BondAttachmentCallback<B, R>
) => (node: HTMLElement) => R;

export function createBondAttachment<B>(context: BondContext<B>): BondAttachment<B> {
	return function bondAttachment<R = void | (() => void)>(callback: BondAttachmentCallback<B, R>) {
		const bond = context.get();
		return (node: HTMLElement) => callback(node, bond);
	};
}

export function createBondTupleAttachment<const Contexts extends readonly BondContext<unknown>[]>(
	contexts: Contexts
) {
	type Bonds = {
		[K in keyof Contexts]: Contexts[K] extends BondContext<infer B> ? B | undefined : never;
	};

	return function bondTupleAttachment<R = void | (() => void)>(
		callback: (node: HTMLElement, ...bonds: Bonds) => R
	) {
		const bonds = contexts.map((context) => context.get()) as Bonds;
		return (node: HTMLElement) => callback(node, ...bonds);
	};
}
