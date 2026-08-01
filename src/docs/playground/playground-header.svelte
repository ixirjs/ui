<script lang="ts">
	let { class: klass = '', children, ...restProps } = $props();
</script>

<h2 class={['mb-6 text-2xl font-bold text-gray-900', klass]} {...restProps}>
	{@render children?.()}
</h2>
