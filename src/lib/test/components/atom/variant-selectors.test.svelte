<script lang="ts">
	import { Button } from '$ixirjs/ui';
	import { HtmlAtom } from '$ixirjs/ui/components/atom';
	import { setPreset } from '$ixirjs/ui/preset';

	// The local `variants` prop is a public escape hatch no shipped component uses, so it needs its
	// own case; a bare function definition stays opaque and is deliberately left alone.
	const localVariants = {
		variants: { emphasis: { high: { class: 'is-high' } } }
	};

	// `tone` is declared only by a compound, never by `variants` — it still selects, so it is still
	// consumed. `title` is declared by neither and has to survive as an ordinary attribute.
	setPreset({
		button: () => ({
			class: 'preset-button',
			variants: {
				variant: { primary: { class: 'is-primary', 'data-variant': 'primary' } },
				size: { sm: { class: 'is-small' } }
			},
			compounds: [{ variant: 'primary', tone: 'loud', class: 'is-loud' }]
		})
	});
</script>

<Button data-testid="selectors" variant="primary" size="sm" tone="loud" title="Save">Save</Button>
<Button data-testid="undeclared" role="link">Link</Button>

<HtmlAtom as="span" data-testid="local" variants={localVariants} emphasis="high" lang="en"
></HtmlAtom>

<!-- Opaque by design: a function definition computes its own props, so nothing is stripped. -->
<HtmlAtom as="span" data-testid="opaque" variants={() => ({ class: 'is-opaque' })} emphasis="high"
></HtmlAtom>
