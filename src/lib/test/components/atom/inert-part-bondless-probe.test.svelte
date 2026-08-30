<script lang="ts">
	// An inert part with no <Alert.Root> above it: `context: 'optional'` renders it bondless, and the
	// fast path must produce the same standalone id shape the constructed Atom did.
	import { Alert } from '$ixirjs/ui/components/alert';
</script>

<Alert.Content data-testid="lone-header">Header</Alert.Content>
