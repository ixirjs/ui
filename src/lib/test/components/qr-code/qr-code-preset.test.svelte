<script lang="ts">
	import { QRCode } from '$ixirjs/ui';
	import { setPreset } from '$ixirjs/ui/preset';

	let active = $state(false);

	setPreset({
		'qr-code': () => ({
			class: active ? 'preset-active' : 'preset-idle',
			attrs: { 'data-preset-state': active ? 'active' : 'idle' }
		})
	});
</script>

<button data-testid="toggle" onclick={() => (active = !active)}>toggle</button>
<QRCode data-testid="qr-code" value="https://example.com" class="consumer-qr" />
