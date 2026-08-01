import { resizeObserver } from '$svelte-atoms/core/attachments/resize-observer.svelte';

export function container() {
	let element = $state<HTMLElement>();
	let size = $state<{ width: number; height: number }>();

	$effect(() => {
		if (!element) return;

		return resizeObserver(() => {
			size = {
				width: element!.clientWidth,
				height: element!.clientHeight
			};
		})(element);
	});

	return {
		get current() {
			return { ...size };
		},
		attach: (node: HTMLElement) => {
			element = node;
		}
	};
}
