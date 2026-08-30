<script lang="ts">
	import Root from './wb-accordion-root.test.svelte';
	import Item from './wb-accordion-item.test.svelte';
	import Header from './wb-accordion-header.test.svelte';
	import Body from './wb-accordion-body.test.svelte';
</script>

<Root multiple values={['a']}>
	<Item value="a">
		<Header data-testid="header-a">A</Header>
		<Body data-testid="body-a">Body A</Body>
	</Item>
	<Item value="b">
		<Header data-testid="header-b">B</Header>
		<Body data-testid="body-b">Body B</Body>
	</Item>
</Root>
