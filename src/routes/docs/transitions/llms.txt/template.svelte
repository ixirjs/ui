<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { inlineCode, codeBlock } from '$docs/md/template';
	import { FrontMatter } from '$docs/md/components';

	let { data } = $props();
	const { frontmatter } = $derived(data);

	const open = '<' + 'script>';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const close = '</' + 'script>';

	const motionExample = `${open}
	import { Component, toTransitionConfig } from '@ixirjs/ui';
	import { animate } from '@ixirjs/vibra';
${close}

<Component
	initial={(node) => {
		node.style.opacity = '0';
		node.style.height = '0';
	}}
	enter={(node) => {
		const animation = animate(
			node,
			{ opacity: 1, height: 'auto' },
			{ duration: 0.2, easing: 'linear' }
		);
		return toTransitionConfig(animation);
	}}
	exit={(node) => {
		const animation = animate(node, { opacity: 0, height: 0 }, { duration: 0.2, easing: 'linear' });
		return toTransitionConfig(animation);
	}}
>
	<!-- Content -->
</Component>`;

	const svelteTransitionsExample = `${open}
	import { Component } from '@ixirjs/ui';
	import { slide, fade } from 'svelte/transition';
${close}

<Component
	enter={(node) => slide(node, { duration: 300 })}
	exit={(node) => fade(node, { duration: 200 })}
>
	<!-- Content -->
</Component>`;

	const accordionExample = `${open}
	import { Accordion, AccordionItem, toTransitionConfig } from '@ixirjs/ui';
	import { animate } from '@ixirjs/vibra';
${close}

<Accordion>
	{#snippet children({ accordion })}
		<AccordionItem.Root value="item-1">
			<AccordionItem.Header>
				<div>Item Header</div>
				<AccordionItem.Indicator
					animate={(node, isOpen) => {
						const animation = animate(node, { rotate: isOpen ? 180 : 0 }, { duration: 0.2 });
						return { duration: 0.2 * 1000, delay: 0 };
					}}
				/>
			</AccordionItem.Header>
			<AccordionItem.Body>
				<div>Item Content</div>
			</AccordionItem.Body>
		</AccordionItem.Root>
	{/snippet}
</Accordion>`;

	const customAnimationExample = `${open}
	import { Component } from '@ixirjs/ui';

	function customEnter(node) {
		// Your custom animation logic
		return {
			duration: 300,
			css: (t) => \`opacity: \${t}; transform: scale(\${t});\`,
			tick: (t) => {
				// Optional: perform non-CSS animations
			}
		};
	}
${close}

<Component
	enter={(node) => customEnter(node)}
>
	<!-- Content -->
</Component>`;
</script>

<FrontMatter {frontmatter} />

# Transitions & Animations Most components in {inlineCode('@ixirjs/ui')} support custom transitions and
animations through lifecycle hooks. This allows you to create smooth enter/exit animations using {inlineCode(
	'@ixirjs/vibra'
)}, Svelte transitions, or custom animation libraries. ## Animation Hooks Components that support
transitions typically provide these props: - {inlineCode('initial')} - Set the initial state before the
element is mounted - {inlineCode('enter')} - Define the enter animation when element appears - {inlineCode(
	'exit'
)} - Define the exit animation when element disappears - {inlineCode('animate')} - Define animations that
run when the element's state changes ## Using @ixirjs/vibra (Recommended) The recommended approach is
to use {inlineCode('@ixirjs/vibra')} with the {inlineCode('toTransitionConfig')} helper:

{codeBlock(motionExample, 'svelte')}

## Using Svelte Transitions You can also use Svelte's built-in transitions:

{codeBlock(svelteTransitionsExample, 'svelte')}

## Using the Animate Hook The {inlineCode('animate')} hook is used for state-driven animations that respond
to prop or state changes, rather than mount/unmount transitions:

{codeBlock(accordionExample, 'svelte')}

The {inlineCode('animate')} function receives the node and current state, allowing you to create reactive
animations. ## Custom Animation Libraries Any animation library that returns a transition config object
can be used:

{codeBlock(customAnimationExample, 'svelte')}
