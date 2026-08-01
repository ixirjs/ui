<script lang="ts">
	import { PortalBond, Teleport } from '$ixirjs/ui/components/portal';

	const props = $state({ id: 'orphan' });
	const orphan = PortalBond.create(props);
</script>

<Teleport portal={orphan}>Panel</Teleport>
