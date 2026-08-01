export const metadata = {
	title: 'Accessibility - Svelte Atoms',
	description: 'Learn about accessibility features built into Svelte Atoms components.',
	pageTitle: 'Accessibility',
	pageDescription:
		'Svelte Atoms components are built with accessibility in mind, following WCAG 2.1 guidelines and best practices.',
	breadcrumbs: [{ label: 'Docs', href: '/docs' }, { label: 'Accessibility' }],

	overview:
		'Svelte Atoms is designed with accessibility as a core principle, not an afterthought. Every component is built to be accessible by default, following WCAG 2.1 guidelines and WAI-ARIA best practices. This ensures your applications are usable by everyone, regardless of their abilities or the assistive technologies they use.',

	sections: [
		{
			title: 'Keyboard Navigation',
			description:
				'All interactive components support full keyboard navigation with intuitive key bindings.'
		},
		{
			title: 'ARIA Attributes',
			description:
				'Components automatically apply proper ARIA attributes for screen reader compatibility.'
		},
		{
			title: 'Focus Management',
			description:
				'Focus is automatically managed in modals, dialogs, and other overlay components with focus trapping.'
		},
		{
			title: 'Semantic HTML',
			description: 'Components use semantic HTML elements and can be customized with the "as" prop.'
		},
		{
			title: 'Screen Reader Support',
			description:
				'All components work seamlessly with popular screen readers like NVDA, JAWS, and VoiceOver.'
		},
		{
			title: 'Color Contrast',
			description: 'Default theme colors meet WCAG AA contrast requirements (4.5:1 minimum).'
		},
		{
			title: 'Reduced Motion',
			description: 'Components respect the prefers-reduced-motion user preference.'
		}
	],

	keyFeatures: [
		'Full keyboard navigation support',
		'Automatic ARIA attribute management',
		'Focus trapping in modals and dialogs',
		'Semantic HTML structure',
		'Screen reader optimized',
		'WCAG 2.1 AA compliant color contrast',
		'Respects reduced motion preferences',
		'Disabled state handling'
	],

	keyboardNavigation: [
		'**Buttons**: Activated with Enter or Space keys',
		'**Menus**: Navigate with Arrow keys, activate with Enter, close with Escape',
		'**Tabs**: Switch tabs with Arrow keys, Home/End for first/last tab',
		'**Dialogs**: Close with Escape, focus trapped within dialog',
		'**Accordions**: Expand/collapse with Enter or Space, navigate with Arrow keys',
		'**Dropdowns**: Open with Enter/Space/Arrow Down, navigate with Arrow keys',
		'**Combobox**: Type to filter, Arrow keys to navigate, Enter to select'
	],

	ariaAttributes: [
		'**aria-expanded**: For collapsible elements (accordions, dropdowns)',
		'**aria-selected**: For selectable items (tabs, menu items)',
		'**aria-checked**: For checkboxes and radio buttons (including mixed state)',
		'**aria-disabled**: For disabled elements',
		'**aria-haspopup**: For elements that trigger popups',
		'**aria-controls**: Links triggers to their controlled elements',
		'**aria-labelledby / aria-describedby**: Associates labels and descriptions',
		'**role**: Proper ARIA roles for semantic meaning'
	],

	focusManagement: [
		'**Focus Trapping**: Dialogs and modals trap focus within their boundaries',
		'**Focus Return**: Focus returns to the trigger element when dialogs close',
		'**Initial Focus**: First focusable element in dialogs receives focus automatically',
		'**Focus Indicators**: All interactive elements have visible focus indicators',
		'**Skip Links**: Use with Link component for keyboard-only navigation'
	],

	semanticHTML: [
		'Cards use proper heading hierarchy',
		'Lists render as \\`<ul>\\` or \\`<ol>\\` elements',
		'Buttons use \\`<button>\\` elements',
		'Links use \\`<a>\\` elements',
		'Form fields use proper \\`<label>\\` associations',
		'Use the \\`as\\` prop to override the default element while preserving behavior'
	],

	screenReaderSupport: [
		'Proper ARIA roles and attributes',
		'Meaningful labels and descriptions',
		'Alert announcements for important changes',
		'Focus management announcements',
		'State change announcements',
		'Hidden decorative elements (aria-hidden)'
	],

	colorContrast: [
		'**Normal text**: 4.5:1 contrast ratio minimum',
		'**Large text**: 3:1 contrast ratio minimum',
		'**Interactive elements**: Clear visual distinction',
		'**Focus indicators**: High contrast borders/outlines',
		'**Disabled states**: Visually distinct but still readable'
	],

	reducedMotion: [
		'Animations are disabled or simplified when motion is reduced',
		'Transitions are instant or minimal',
		'No parallax or auto-playing animations',
		'Smooth scroll behavior is disabled'
	],

	testingPractices: [
		'**Keyboard Testing**: Navigate your entire app using only the keyboard',
		'**Screen Reader Testing**: Use NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)',
		'**Contrast Testing**: Use browser DevTools or online tools to verify contrast ratios',
		'**Automated Testing**: Use tools like axe DevTools or Lighthouse',
		'**Manual Testing**: Test with actual assistive technologies',
		'**User Testing**: Include users with disabilities in your testing process'
	],

	bestPractices: [
		'Always provide text alternatives for images and icons',
		'Use semantic HTML elements appropriately',
		'Maintain logical heading hierarchy',
		'Provide clear focus indicators',
		'Test with keyboard navigation',
		'Test with screen readers',
		'Ensure sufficient color contrast',
		'Support reduced motion preferences',
		'Never disable focus outlines without replacement',
		'Use ARIA attributes correctly (prefer semantic HTML when possible)'
	],

	resources: [
		'[WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)',
		'[WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)',
		'[WebAIM](https://webaim.org/)',
		'[a11y Project](https://www.a11yproject.com/)'
	],

	examples: {
		keyboard: `<!Buttoncomponent -->
<Button.Root>
  Click me
</Button.Root>
<!-- Supports: Enter, Space -->

<!-- Menu component -->
<DropdownMenu.Root>
  <DropdownMenu.Trigger base={Button}>Open Menu</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>Option 1</DropdownMenu.Item>
    <DropdownMenu.Item>Option 2</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
<!-- Supports: Arrow keys, Enter, Escape -->

<!-- Tabs component -->
<Tabs.Root>
  <Tabs.Header>
    <Tabs.Tab value="1">Tab 1</Tabs.Tab>
    <Tabs.Tab value="2">Tab 2</Tabs.Tab>
  </Tabs.Header>
</Tabs.Root>
<!-- Supports: Arrow keys, Home, End -->`,

		aria: `<!-- Dialog with ARIA attributes -->
<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>
        <!-- Automatically sets aria-labelledby -->
        Confirm Action
      </Dialog.Title>
      <Dialog.Description>
        <!-- Automatically sets aria-describedby -->
        Are you sure you want to continue?
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>

<!-- Accordion with state attributes -->
<Accordion.Root>
  <Accordion.Item>
    <Accordion.Item.Header>
      <!-- aria-expanded automatically managed -->
      Section Title
    </Accordion.Item.Header>
    <Accordion.Item.Body>
      <!-- aria-controls automatically set -->
      Content
    </Accordion.Item.Body>
  </Accordion.Item>
</Accordion.Root>

<!-- Checkbox with mixed state -->
<Checkbox 
  bind:checked 
  bind:indeterminate
>
  <!-- aria-checked="mixed" when indeterminate -->
  Accept terms
</Checkbox>`,

		focusTrap: `<script>
  let dialogOpen = $state(false);
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content>
    <!-- Focus automatically trapped within dialog -->
    <!-- Tab cycles through focusable elements -->
    <!-- Shift+Tab reverses direction -->
    
    <Dialog.Header>
      <Dialog.Title>Modal Dialog</Dialog.Title>
    </Dialog.Header>
    
    <Dialog.Body>
      <input type="text" placeholder="First field" />
      <input type="text" placeholder="Second field" />
    </Dialog.Body>
    
    <Dialog.Footer>
      <Button onclick={() => dialogOpen = false}>Cancel</Button>
      <Button>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>`,

		focusManagement: `<script>
  import { Popover } from '@ixirjs/ui/components/popover';
  
  let open = $state(false);
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    <!-- Focus returns here when popover closes -->
    Open Popover
  </Popover.Trigger>
  
  <Popover.Content>
    <!-- Focus moves to first focusable element when opened -->
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </Popover.Content>
</Popover.Root>`,

		semantic: `<!-- Card with proper semantic structure -->
<Card.Root>
  <Card.Header>
    <!-- Uses semantic header element -->
    <Card.Title>Card Title</Card.Title>
  </Card.Header>
  
  <Card.Body>
    <!-- Main content area -->
    Content goes here
  </Card.Body>
  
  <Card.Footer>
    <!-- Uses semantic footer element -->
    Footer content
  </Card.Footer>
</Card.Root>

<!-- List with proper semantics -->
<List.Root as="ul">
  <!-- Renders as <ul> element -->
  <List.Item>Item 1</List.Item>
  <List.Item>Item 2</List.Item>
</List.Root>

<!-- Accordion with semantic structure -->
<Accordion.Root as="ul">
  <!-- Can render as ul/ol for semantic lists -->
  <Accordion.Item as="li">
    <Accordion.Item.Header>Section</Accordion.Item.Header>
    <Accordion.Item.Body>Content</Accordion.Item.Body>
  </Accordion.Item>
</Accordion.Root>`,

		screenReader: `<!-- Alert with proper role -->
<Alert variant="destructive" role="alert">
  <!-- Announced immediately by screen readers -->
  <Alert.Title>Error</Alert.Title>
  <Alert.Description>
    Something went wrong
  </Alert.Description>
</Alert>

<!-- Button with accessible label -->
<Button aria-label="Close dialog">
  <!-- Icon only, needs aria-label -->
  <XIcon />
</Button>

<!-- Form field with proper association -->
<Form.Field>
  <Label for="email">Email Address</Label>
  <Input id="email" type="email" />
  <Form.Description>
    <!-- Associated with input via aria-describedby -->
    We'll never share your email
  </Form.Description>
</Form.Field>`,

		customAttributes: `<script>
  import { defineVariants } from '@ixirjs/ui/utils';
  
  const alertVariants = defineVariants({
    class: 'rounded-lg p-4 border',
    variants: {
      variant: {
        error: {
          class: 'bg-destructive/10 text-destructive',
          role: 'alert',
          'aria-live': 'assertive'
        },
        warning: {
          class: 'bg-yellow-50 text-yellow-900',
          role: 'status',
          'aria-live': 'polite'
        }
      }
    }
  });
</script>

<!-- Variants automatically apply ARIA attributes -->
<HtmlAtom variants={alertVariants} variant="error">
  <!-- role="alert" and aria-live="assertive" applied -->
  Critical error message
</HtmlAtom>`,

		disabledState: `<!-- Button with disabled state -->
<Button disabled>
  <!-- aria-disabled automatically set -->
  <!-- Pointer events disabled -->
  <!-- Visual opacity applied -->
  Disabled Button
</Button>

<!-- Menu item with disabled state -->
<DropdownMenu.Root>
  <DropdownMenu.Trigger base={Button}>Menu</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item disabled>
      <!-- aria-disabled="true" -->
      <!-- tabindex="-1" to skip in navigation -->
      Disabled Option
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Form input with disabled state -->
<Input disabled />
<!-- Native disabled attribute -->
<!-- Excluded from form submission -->`,

		visualIndicators: `<!-- All interactive components have focus styles -->
<style>
  /* Applied automatically by components */
  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
</style>

<!-- Buttons -->
<Button>
  <!-- Focus ring automatically applied -->
  Click me
</Button>

<!-- Links -->
<Link href="/page">
  <!-- Focus ring with offset -->
  Navigate
</Link>

<!-- Custom focus styles -->
<Button class="focus:ring-4 focus:ring-primary">
  <!-- Override with custom styles -->
  Custom Focus
</Button>`,

		reducedMotion: `<script>
  import { Accordion } from '@ixirjs/ui/components/accordion';
  
  // Components respect prefers-reduced-motion
</script>

<Accordion.Root>
  <Accordion.Item>
    <!-- Animation duration automatically reduced -->
    <!-- when user prefers reduced motion -->
    <Accordion.Item.Header>Section</Accordion.Item.Header>
    <Accordion.Item.Body>
      Content with reduced motion support
    </Accordion.Item.Body>
  </Accordion.Item>
</Accordion.Root>

<!-- Custom animations should check preference -->
<script>
  import { animate } from '@ixirjs/vibra';
  
  function handleEnter(element) {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    
    return animate(
      element,
      { opacity: [0, 1] },
      { duration: prefersReducedMotion ? 0 : 0.3 }
    );
  }
</script>`,

		colorContrast: `<!-- All theme colors meet WCAG AA standards -->

<!-- Primary actions (4.5:1 minimum) -->
<Button variant="primary">
  <!-- bg-primary / text-primary-foreground -->
  Primary Action
</Button>

<!-- Secondary actions -->
<Button variant="secondary">
  <!-- bg-secondary / text-secondary-foreground -->
  Secondary Action
</Button>

<!-- Destructive actions -->
<Button variant="destructive">
  <!-- bg-destructive / text-destructive-foreground -->
  Delete
</Button>

<!-- Muted text (minimum 4.5:1) -->
<p class="text-muted-foreground">
  Secondary information with proper contrast
</p>`,

		testing: `<!-- Add data-testid for testing -->
<Button data-testid="submit-button">
  Submit
</Button>

<!-- Use presets to apply test IDs globally -->
<script>
  import { setPreset } from '@ixirjs/ui/preset';
  
  setPreset({
    button: () => ({
      'data-component': 'button',
      'data-testid': 'button-element'
    }),
    dialog: () => ({
      'data-component': 'dialog',
      'data-testid': 'dialog-element'
    })
  });
</script>

<!-- Testing with Playwright -->
<script lang="ts">
  // In your test file
  import { test, expect } from '@playwright/test';
  
  test('button is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab to button
    await page.keyboard.press('Tab');
    
    // Verify focus
    await expect(page.getByTestId('submit-button')).toBeFocused();
    
    // Activate with Enter
    await page.keyboard.press('Enter');
  });
</script>`
	}
};
