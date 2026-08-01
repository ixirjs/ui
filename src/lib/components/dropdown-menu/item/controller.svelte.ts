// Structural contract for items held in the bond's #items map.
// Implemented by SelectItemController; rendered items are now Atoms.

export type DropdownMenuItemControllerProps = {
	readonly id: string;
};

export interface DropdownMenuItemControllerInterface<Props extends Record<string, unknown>> {
	get id(): string;
	get createdAt(): Date;
	get props(): Props;
	get element(): HTMLElement | null;
	get isHighlighted(): boolean;

	mount(): () => void;
	unmount(): void;
	destroy(): void;
	share(): DropdownMenuItemControllerInterface<Props>;
	elementProps(): Record<string, unknown>;
}
