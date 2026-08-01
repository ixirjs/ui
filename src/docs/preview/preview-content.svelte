<script lang="ts">
	import { mount } from 'svelte';
	import Frame from './frame.svelte';

	let element: HTMLDivElement | undefined = $state();

	let { title = '', children, ...restProps } = $props();

	$effect(() => {
		if (!element) return;

		mount(Frame, {
			target: element,
			props: {
				title,
				children,
				...restProps
			}
		});
	});
</script>

<div
	{@attach (node) => {
		element = node;
	}}
	{...restProps}
></div>
