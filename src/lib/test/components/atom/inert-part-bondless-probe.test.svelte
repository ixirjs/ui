<script lang="ts">
	// An inert part with no <Card.Root> above it: `context: 'optional'` renders it bondless, and the
	// fast path must produce the same standalone id shape the constructed Atom did.
	import { Card } from '$ixirjs/ui/components/card';
</script>

<Card.Header data-testid="lone-header">Header</Card.Header>
