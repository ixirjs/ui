<script lang="ts" module>
	import {
		PortalBond,
		type PortalBondProps
	} from '$ixirjs/ui/components/portal/instance/bond.svelte';

	export let capturedBond: PortalBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Portal, Portals } from '$ixirjs/ui/components/portal';

	function captureFactory(props: PortalBondProps): PortalBond {
		capturedBond = PortalBond.create(props);
		return capturedBond;
	}
</script>

<Portals id="root">
	<Portal.Outer id="probe" factory={captureFactory}>
		<Portal.Inner />
	</Portal.Outer>
</Portals>
