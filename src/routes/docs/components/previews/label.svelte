<script lang="ts">
	import { Input } from '$lib/components/input';
	import { Label } from '$lib/components/label';
</script>

<div class="w-48 flex flex-col gap-1.5">
	<Label for="prev-lbl">Email address</Label>
	<Input.Root id="prev-lbl">
		<Input.EmailControl placeholder="you@example.com" />
	</Input.Root>
</div>
