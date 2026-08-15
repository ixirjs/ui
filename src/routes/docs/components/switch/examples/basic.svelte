<script lang="ts">
	import { Switch } from '$lib/components/switch';

	let notifications = $state(true);
</script>

<div class="flex flex-col gap-3">
	<Switch bind:checked={notifications} name="notifications">Email notifications</Switch>
	<code class="text-muted-foreground text-xs">checked = {notifications}</code>
</div>
