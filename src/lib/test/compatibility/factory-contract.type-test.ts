import type { CardRootProps } from '@ixirjs/ui/components/card';

// CardBond is structural today. Adding a private/protected brand to the implementation
// would reject a factory that does not subclass it, despite unchanged public members.
export const structuralFactory: NonNullable<CardRootProps['factory']> = (props) => ({
	name: 'card',
	props,
	titleId: undefined,
	descriptionId: undefined,
	get id() {
		return props.id ?? 'consumer-card';
	},
	get rootId() {
		return `card-root-${this.id}`;
	},
	get isDisabled() {
		return props.disabled ?? false;
	},
	get isClickable() {
		return props.clickable ?? false;
	},
	get element() {
		return undefined;
	}
});
