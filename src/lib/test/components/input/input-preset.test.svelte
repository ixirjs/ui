<script lang="ts">
	import { Input } from '$ixirjs/ui';
	import { setPreset } from '$ixirjs/ui/preset';

	let active = $state(false);
	const variants = {
		disabled: {
			true: { 'data-disabled-variant': 'yes' }
		},
		tone: {
			calm: { class: 'tone-calm', 'data-tone': 'calm', 'aria-label': 'calm input' },
			active: { class: 'tone-active', 'data-tone': 'active', 'aria-label': 'active input' }
		}
	};

	setPreset({
		'input.text': () => ({
			class: active ? 'theme-active' : 'theme-calm',
			attrs: { 'data-theme': active ? 'active' : 'calm' },
			variants,
			defaults: { tone: active ? 'active' : 'calm' }
		})
	});
</script>

<button data-testid="toggle" onclick={() => (active = !active)}>toggle</button>
<div data-testid="control"><Input.TextControl class="consumer" disabled /></div>
