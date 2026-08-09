<!--
  Form-submission shim for controls whose visible parts are not a single named <input> — the
  segmented ones (time, datetime, color) render spans, and OTP renders one input per digit. Without
  this their value never reaches a plain <form> POST, and spreading `name` onto their wrapper does
  nothing, since a name is only meaningful on a form control.

  Rendered only when a `name` is given, so an uncontrolled-in-JS control costs nothing.
-->
<script lang="ts">
	// `name` mirrors HTMLInputAttributes, which allows null as well as undefined.
	let {
		name = undefined,
		value = ''
	}: { name?: string | null | undefined; value?: string | undefined } = $props();
</script>

{@render (name ? hidden : undefined)?.()}

{#snippet hidden()}
	<input type="hidden" {name} {value} />
{/snippet}
