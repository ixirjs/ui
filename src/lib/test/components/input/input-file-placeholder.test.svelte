<!--
  Input.Placeholder decides visibility from the registered control's `type`. The file branch used
  to test for the type string `'files'`, which no DOM input ever reports — and until FileControl
  registered an Atom there was no element to read a type from at all, so the branch was doubly
  dead and the placeholder never hid once files were picked.
-->
<script lang="ts">
	import * as Input from '$ixirjs/ui/components/input/atoms';

	// One-way: Input.Root's `files` is a plain prop, not `$bindable` — it is the bond's state, and
	// `bond.props.files` is what the placeholder reads.
	let { files = [] }: { files?: File[] } = $props();
</script>

<Input.Root {files}>
	<Input.FileControl {files} />
	<Input.Placeholder>choose something</Input.Placeholder>
</Input.Root>
