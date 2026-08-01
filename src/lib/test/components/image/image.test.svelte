<script lang="ts">
	import { Image } from '$ixirjs/ui';
</script>

<!-- The spec dispatches the failure event explicitly; keep the fixture self-contained and SSR-safe. -->
<Image
	data-testid="image"
	src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
	alt="Example image"
>
	<span>Fallback content</span>
</Image>
