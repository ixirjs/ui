<script lang="ts">
	import { DatePicker } from '$ixirjs/ui/components/date-picker';
	import { Root } from '$ixirjs/ui/components/root';
	import type { DatePickerPresets } from '$ixirjs/ui/components/date-picker';

	let { presets }: { presets: DatePickerPresets } = $props();
</script>

<Root>
	<DatePicker.Root open {presets}>
		<DatePicker.Trigger>Open</DatePicker.Trigger>
		<DatePicker.Calendar />
	</DatePicker.Root>
</Root>
