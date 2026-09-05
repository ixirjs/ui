// Disclosure owns boolean operations, not storage. No selection model or array adaptation.
export interface Disclosure {
	readonly isOpen: boolean;
	open(): void;
	close(): void;
	toggle(): void;
}

export interface DisclosureBacking {
	get(): boolean;
	set(open: boolean): void;
}

export function createDisclosure(backing: DisclosureBacking): Disclosure {
	const close = () => {
		// Preserve the adapter's read-before-close ordering, including a throwing backing getter.
		void backing.get();
		backing.set(false);
	};
	return {
		get isOpen() {
			return Boolean(backing.get());
		},
		// Do not equality-gate: backing owners decide whether repeated requests should notify.
		open: () => backing.set(true),
		close,
		toggle: () => {
			if (backing.get()) close();
			else backing.set(true);
		}
	};
}
