import { animate, type Easing } from '$ixirjs/ui/shared';
import { DURATION } from '$ixirjs/ui/shared';
import { SidebarBond } from './bond.svelte';

type AnimateSidebarContentParams = {
	duration?: number;
	delay?: number;
	ease?: Easing | Easing[];
	axis?: 'x' | 'y';
	0?: number | string;
	1?: number | string;
};

export function animateSidebarContent(params: AnimateSidebarContentParams) {
	const {
		duration = DURATION.fast / 1000,
		delay = 0,
		ease = 'easeInOut',
		axis = 'x',
		'0': collapsedSize = '96px',
		'1': expandedSize = 'auto'
	} = params;
	const bond = SidebarBond.get();

	return (node: HTMLElement) => {
		const isOpen = bond?.props.open ?? false;

		const collapsedProp = axis === 'x' ? 'min-width' : 'min-height';
		const prop = axis === 'x' ? 'width' : 'height';

		animate(
			node,
			{
				[prop]: isOpen ? expandedSize : collapsedSize,
				[collapsedProp]: collapsedSize
			},
			{ duration, ease, delay }
		);
	};
}
