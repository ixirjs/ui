<script lang="ts">
	let { class: klass = '', children, ...restProps } = $props();
</script>

<div class={['flex w-full flex-col gap-0', klass]} {...restProps}>
	{@render children?.()}
</div>
