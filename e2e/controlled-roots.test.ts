import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Interaction coverage for the roots that bind a controlled prop.
 *
 * Every root in the library now binds through `useRoot`, and a controlled `$bindable` prop is
 * declared with `controlledProp(...)`, whose owner adoption the seam discharges. That adoption is
 * invisible when it works and silent when it does not: the binding still renders, state still
 * flows one way, and only the `onchange` callback stops firing. Unit specs cover the callback
 * contract per family; these cover the other half — that the round trip still drives the real DOM
 * in a real browser, on the built app, for families whose roots were migrated.
 *
 * They drive the documentation pages rather than a fixture route, so they exercise the shipped
 * composition (portal, escape stack, focus, preset resolution) rather than a reduced harness.
 * Assertions are on roles, ARIA state and `data-open` — never on prose — so editing the docs copy
 * does not break them.
 *
 * Everything is scoped to `[data-example-preview]`. The docs shell navigates with the library's own
 * Tree, so an unscoped `[aria-expanded]` or `getByRole('button')` matches the sidebar long before
 * it reaches the demo.
 */

async function firstPreview(page: Page, slug: string): Promise<Locator> {
	await page.goto(`/docs/components/${slug}`);
	const preview = page.locator('[data-example-preview]').first();
	await expect(preview).toBeVisible();
	return preview;
}

test.describe('collapsible', () => {
	test('header click toggles expanded state and returns on a second click', async ({ page }) => {
		const preview = await firstPreview(page, 'collapsible');

		const trigger = preview.locator('[aria-expanded]').first();
		await expect(trigger).toBeVisible();
		const before = (await trigger.getAttribute('aria-expanded')) ?? 'false';

		await trigger.click();
		await expect(trigger).toHaveAttribute('aria-expanded', before === 'true' ? 'false' : 'true');

		// The return trip is the half that fails if a controlled cell latches after its first write.
		await trigger.click();
		await expect(trigger).toHaveAttribute('aria-expanded', before);
	});
});

test.describe('accordion', () => {
	test('expanding an item updates its trigger state', async ({ page }) => {
		const preview = await firstPreview(page, 'accordion');

		const trigger = preview.locator('[aria-expanded]').first();
		await expect(trigger).toBeVisible();
		const before = (await trigger.getAttribute('aria-expanded')) ?? 'false';

		await trigger.click();
		await expect(trigger).toHaveAttribute('aria-expanded', before === 'true' ? 'false' : 'true');
	});
});

test.describe('dialog', () => {
	test('opens from its trigger and closes on Escape', async ({ page }) => {
		const preview = await firstPreview(page, 'dialog');

		// Page-scoped, not preview-scoped: the surface is portalled to the root portal host, so it is
		// deliberately NOT a descendant of the example that owns it. Its trigger still is.
		//
		// A closed dialog also stays in the DOM — inert and fully transparent rather than removed —
		// so `data-open` is the state to assert on, not visibility.
		const dialog = page.getByRole('dialog').first();
		await expect(dialog).toHaveAttribute('data-open', 'false');

		await preview.getByRole('button').first().click();
		await expect(dialog).toHaveAttribute('data-open', 'true');

		// Escape exercises the escape-stack capability on top of the controlled open prop: the
		// capability requests the close, the controlled cell commits it, the root re-renders.
		await page.keyboard.press('Escape');
		await expect(dialog).toHaveAttribute('data-open', 'false');
	});
});

test.describe('tabs', () => {
	test('selecting a tab moves selection to it', async ({ page }) => {
		const preview = await firstPreview(page, 'tabs');

		const tabs = preview.getByRole('tab');
		await expect(tabs.first()).toBeVisible();
		expect(await tabs.count()).toBeGreaterThan(1);

		const second = tabs.nth(1);
		await second.click();
		await expect(second).toHaveAttribute('aria-selected', 'true');
		await expect(tabs.first()).toHaveAttribute('aria-selected', 'false');
	});
});
