import { animate, type Easing } from '$ixirjs/ui/authoring';
import { DURATION } from '$ixirjs/ui/authoring';
import { SidebarContext } from './bond.svelte';

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
	const bond = SidebarContext.getOptional();

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
