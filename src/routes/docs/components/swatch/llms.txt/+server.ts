import type { RequestHandler } from './$types';
import { md } from '$docs/md/template';

export const GET: RequestHandler = () => {
	return new Response(build(), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
};

function build(): string {
	return md`
---
id: swatch
title: Swatch Component
category: components
subcategory: display
depth: beginner
related:
  - input
---

# Swatch

Displays a color value as a small preview square. Shows a checkerboard pattern for transparent or empty colors.

## Import

~~~ts
import { Swatch } from '@ixirjs/ui/components/swatch';
~~~

## Props

| Prop    | Type     | Default | Description                                                           |
| ------- | -------- | ------- | --------------------------------------------------------------------- |
| \`color\` | \`string\` | \`''\`    | Any valid CSS color string. Empty or missing shows checkerboard only. |
| \`class\` | \`string\` | \`''\`    | Tailwind/CSS classes for sizing and border-radius.                    |

## Examples

### Basic

~~~svelte
<Swatch color="oklch(0.65 0.18 253)" class="h-6 w-6 rounded" />
<Swatch color="#e11d48" class="h-6 w-6 rounded" />
<Swatch color="hsl(142 71% 45%)" class="h-6 w-6 rounded" />
~~~

### Transparent / Alpha

~~~svelte
<Swatch color="transparent" class="h-6 w-6 rounded" />
<Swatch color="oklch(0.65 0.18 253 / 0.4)" class="h-6 w-6 rounded" />
<Swatch color="" class="h-6 w-6 rounded" />
~~~

Checkerboard shows through wherever the color is transparent.

### Sizes & Radius

Size and radius are fully controlled via classes:

~~~svelte
<Swatch color="#6366f1" class="h-4 w-4 rounded-sm" />
<Swatch color="#6366f1" class="h-8 w-8 rounded-md" />
<Swatch color="#6366f1" class="h-10 w-10 rounded-full" />
~~~

## Inside an Input

For use inside \`Input.Root\`, prefer \`Input.ColorSwatch\` — it reads the color from the Input bond automatically:

~~~svelte
<Input.Root>
	<Input.ColorSwatch />
	<Input.ColorControl bind:value={color} />
</Input.Root>
~~~

Use the standalone \`Swatch\` when you manage the color value yourself outside of an Input context.
	`.trim();
}
