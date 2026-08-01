<script>
	import { mergePresetProps } from '$svelte-atoms/core/components/atom';
	import { Input } from '../input';

	let { class: klass = '', children, preset = undefined, ...restProps } = $props();

	const textareaProps = $derived(mergePresetProps(preset, 'textarea', restProps));
</script>

<Input.Root class={['h-auto', klass]} {...textareaProps}>
	{@render children?.()}
</Input.Root>
