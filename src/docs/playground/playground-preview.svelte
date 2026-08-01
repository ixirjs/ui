<script lang="ts">
	let { class: klass = '', children, ...restProps } = $props();
</script>

<div
	class={['grid h-full w-full grid-cols-1 grid-rows-1 place-items-center', klass]}
	{...restProps}
>
	{@render children?.()}
</div>
