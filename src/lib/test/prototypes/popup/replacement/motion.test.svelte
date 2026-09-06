<script lang="ts">
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';
	import type { DropdownMenuItemProps } from '$ixirjs/ui/components/dropdown-menu/item/types';

	let {
		...props
	}: Pick<DropdownMenuItemProps, 'motion' | 'oninit' | 'onmount' | 'ondestroy' | 'as' | 'base'> =
		$props();
</script>

<DropdownMenu.Root open>
	<DropdownMenu.Item {...props}>Animated item</DropdownMenu.Item>
</DropdownMenu.Root>
