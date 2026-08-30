<script lang="ts">
	// The same bondless parts, with an EXPLICIT `id={undefined}` — the shape a consumer produces by
	// writing `id={someOptionalProp}`. It is not the same as omitting the attribute: it puts
	// `id: undefined` in the source the class-only lane spreads over its own attrs, which is why it
	// gets its own probe rather than a flag on the one next door.
	//
	// Both kinds of slot are here because they answer differently and both answers matter. `Title`
	// is registered (it declares `role: 'label'`), so an absent consumer id must NOT erase the
	// derived one — that is the guard the class-only lane needs, since the id is what cross-slot
	// ARIA points at. `Header` is inert, so it has no derived id to protect.
	import { Alert } from '$ixirjs/ui/components/alert';

	const id: string | undefined = undefined;
</script>

<Alert.Content data-testid="undefined-id-header" {id}>Header</Alert.Content>
<Alert.Title data-testid="undefined-id-title" {id}>Title</Alert.Title>
