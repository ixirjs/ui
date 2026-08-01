<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, inlineCode, list } from '$docs/md/template';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'motion',
		title: 'Motion System',
		category: 'animation',
		depth: 'intermediate',
		prerequisites: [],
		related: ['transitions', 'styling', 'crafting']
	};
</script>

<FrontMatter {frontmatter} />

# Motion and Animation Motion APIs are available on {inlineCode('HtmlElement')} and {inlineCode(
	'HtmlAtom'
)}. Supported hooks:

{list([
	'initial(node): one-time setup before transitions run',
	'enter(node): intro transition config',
	'exit(node): outro transition config',
	'animate(node): reactive animation hook after intro',
	'onmount(node) / ondestroy(node): lifecycle hooks'
])}

## Native Svelte transitions

{codeBlock(
	`<script lang="ts">
  import { HtmlAtom } from '@svelte-atoms/core';
  import { fade, slide } from 'svelte/transition';

  let open = $state(true);
</script>

{#if open}
  <HtmlAtom
    enter={(node) => fade(node, { duration: 200 })}
    exit={(node) => slide(node, { duration: 160 })}
  >
    Animated block
  </HtmlAtom>
{/if}`,
	'svelte'
)}

## Reactive animation with external libraries

{codeBlock(
	`<script lang="ts">
  import { HtmlAtom } from '@svelte-atoms/core';
  import gsap from 'gsap';

  let open = $state(false);
</script>

<HtmlAtom
  initial={(node) => gsap.set(node, { opacity: 0, y: 12 })}
  animate={(node) => {
    gsap.to(node, {
      opacity: open ? 1 : 0,
      y: open ? 0 : 12,
      duration: 0.2
    });
  }}
>
  Content
</HtmlAtom>`,
	'svelte'
)}

## Notes - {inlineCode('global')} defaults to {inlineCode('true')} for transitions. - Use {inlineCode(
	'initial'
)} for setup only; use {inlineCode('animate')} for state-driven updates. - Return a valid Svelte transition
config from {inlineCode('enter')} and {inlineCode('exit')}.
