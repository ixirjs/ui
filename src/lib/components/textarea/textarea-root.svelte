<script>
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { Input } from '$ixirjs/ui/components/input';

	let { class: klass = '', children, preset = undefined, ...restProps } = $props();

	const textareaProps = $derived(mergePresetProps(preset, 'textarea', restProps));
</script>

<Input.Root class={['h-auto', klass]} {...textareaProps}>
	{@render children?.()}
</Input.Root>
