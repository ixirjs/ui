<script lang="ts">
	let { class: klass = '', value = $bindable(), ...restProps } = $props();
</script>

<textarea
	class={['border-border w-full p-2 outline-none', '$preset', klass]}
	bind:value
	{...restProps}></textarea>
