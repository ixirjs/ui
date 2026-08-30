<script lang="ts">
	// @ts-nocheck — vendored third-party source; see bench/vs-shadcn/README.md
	import { Select as SelectPrimitive } from "bits-ui";

	let { ref = $bindable(null), ...restProps }: SelectPrimitive.GroupProps = $props();
</script>

<SelectPrimitive.Group bind:ref data-slot="select-group" {...restProps} />
