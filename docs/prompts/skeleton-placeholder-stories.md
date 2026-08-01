# Prompt — Skeleton-Placeholder Stories

A reusable prompt for turning a rich, fully-designed Storybook story into a **skeleton-placeholder host layout** where only the component under test is fully rendered. Paste the section below into a new chat and fill in the `<<…>>` blanks.

---

## The prompt

> Refactor the Storybook story/stories at `<<path/to/*.stories.svelte>>` so the **host layout becomes placeholder skeleton blocks** while the component(s) I'm actually demoing — `<<ComponentName(s)>>` — stay **fully rendered, styled, and interactive** in their real positions.
>
> Follow these rules:
>
> **1. Identify subject vs. host.**
>
> - The _subject_ is the component the story exists to demo (`<<ComponentName>>`). Render it normally with its real props, real menu data, and real styling.
> - Everything else (page chrome: headers, toolbars, lists, nav, cards, footers) is _host_ — replace its content with neutral skeleton blocks. Keep just enough structural layout (the containers, the flex/grid skeleton, sticky regions) to give the subject realistic context.
>
> **2. Skeleton block conventions** (static muted blocks — a classic loading-skeleton look):
>
> - Text line: `class="bg-muted h-3 rounded-full <width>"` with varied widths (`w-24`, `w-1/2`, …).
> - Secondary / dimmer line: `class="bg-muted/60 h-2.5 rounded-full <width>"`.
> - Avatar / icon square: `class="bg-muted h-N w-N rounded-md"` (or `rounded-full`).
> - Larger fill (search field, value, button): `class="bg-muted/60 rounded-lg <h/w>"`.
> - Keep real container chrome (borders, `rounded-xl`, dividers) so it reads as a layout, not a blank box.
> - **Do not** add `animate-pulse` by default — a pulsing host competes visually with the live subject. Mention it as an opt-in.
>
> **3. Make the host scroll so the subject can be tested inside a scroll container.**
>
> - Add enough placeholder rows/sections that the relevant container overflows.
> - Generate repeated rows with keyed loops that don't introduce unused bindings:
>   ```svelte
>   {#each Array.from({ length: 16 }, (_, i) => i) as i (i)}
>   	{@const w = ['w-28', 'w-36', 'w-24', 'w-32', 'w-40', 'w-20'][i % 6]}
>   	<!-- skeleton row; include the real subject popover/menu here if it lives per-row -->
>   {/each}
>   ```
> - Ensure a correct scroll container: a **bounded height** (`max-h-…`, or a flex parent at `h-screen`) **plus** `overflow-y-auto`. A `flex-1` child that should scroll also needs `min-h-0` (flex items default to `min-height:auto` and won't shrink below content otherwise).
> - **Respect the component's own DOM.** If a wrapper component already sets `max-h-screen overflow-y-auto` and wraps children in an extra element (e.g. an `Overlay`/`relative` block), do **not** fight it with your own `overflow-hidden` + `flex-col` — that breaks the flex chain and nothing scrolls. Instead use the component's scroll container and pin chrome with `position: sticky` (`sticky top-0` / `sticky bottom-0` + a matching `bg-*` and `z-*`).
>
> **4. Keep the subject's real data, trim the rest.**
>
> - Keep only the state/derived/imports the rendered subjects need (menu option arrays, open-state flags, animation attaches).
> - Delete now-unused demo state (record arrays, filter logic, derived counts, status maps, etc.) so there are no unused-variable lints.
>
> **5. Verify it actually scrolls and the subject still positions correctly.** If Storybook is running, drive it with Playwright against the story iframe and (a) screenshot each story with a subject popover/menu open, and (b) assert the scroll container overflows:
>
> ```js
> // iframe URL: http://localhost:6006/iframe.html?viewMode=story&id=<group>--<story>
> const m = await page.$eval('<scroll-selector>', (el) => ({
> 	sh: el.scrollHeight,
> 	ch: el.clientHeight,
> 	scrollable: el.scrollHeight > el.clientHeight + 1
> }));
> ```
>
> If a container reports `scrollHeight === clientHeight` unexpectedly, walk the computed styles up the parent chain (`getComputedStyle` for `display`/`overflowY`/`minHeight`/height) to find the element that isn't bounded — usually a missing `min-h-0` or a component-injected wrapper.
>
> Leave the change in the working tree; don't commit unless I ask.

---

## Notes & rationale

- **Why static skeletons:** the point is to spotlight the live component. A pulsing or fully-designed host pulls the eye away from the thing being demoed.
- **Why `Array.from({ length: n }, (_, i) => i)`:** Svelte's `{#each arr as item}` would leave an unused `item` binding if you only need the index; mapping to the index makes the binding meaningful and lint-clean. Vary widths via `[…][i % k]` so the skeleton looks organic.
- **The classic flex-scroll bug:** `flex-1 overflow-y-auto` without `min-h-0` grows to content height instead of scrolling. Always add `min-h-0` to a flex child that must scroll.
- **The wrapper-component trap:** some design-system components wrap `children` in an internal element with its own height/overflow. Your layout classes land on the outer shell, not on the element that directly parents your content — so a flex chain you "set" may not reach your rows. Inspect the rendered DOM before assuming your classes took effect; prefer the component's intended scroll seam and `sticky` for pinned chrome.
- **Scrollbars:** if the project ships a global thin scrollbar (e.g. in `app.css`), you usually don't need per-container scrollbar styling — just get `overflow`/bounded-height right.

## Worked example

See `src/lib/components/popover/popover.stories.svelte` — the "Popover in Dialog/Drawer/Sidebar" stories use skeleton hosts with real `Popover` triggers/menus, each inside a verified scroll container.
