<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { inlineCode, codeBlock } from '$docs/md/template';
	import { FrontMatter, List } from '$docs/md/components';

	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

// eslint-disable-next-line @typescript-eslint/no-unused-vars

<FrontMatter {frontmatter} />

# {metadata.pageTitle}

{metadata.pageDescription}

## Requirements Before getting started, make sure your project meets the following requirements:

{#each metadata.requirements as req, i (i)}
	### {req.requirement}

	**Version:** {req.version}

	{req.description}
{/each}

## Installation Install {inlineCode('@svelte-atoms/core')} using your preferred package manager:

{codeBlock(
	`# npm
npm install @svelte-atoms/core

# pnpm
pnpm add @svelte-atoms/core

# yarn
yarn add @svelte-atoms/core

# bun
bun add @svelte-atoms/core`,
	'bash'
)}

## Configuration

{#each metadata.installationSteps as step, i (i)}
	### Step {step.step}: {step.title}

	{step.description}
{/each}

### Step 1: Import Internal Styles Import the internal style file in your root layout file:

{codeBlock(
	`<!-- src/routes/+layout.svelte -->
<script>
  import '@svelte-atoms/core/styles/internal.css';
</script>

<slot />`,
	'svelte'
)}

**Important:** The internal styles are minimal and only include necessary component styles. They
don't include any opinionated styling or themes. ### Step 2: Setup App CSS Configure Tailwind CSS
and CSS variables for theming:

{codeBlock(
	`/* src/app.css */
@import 'tailwindcss';

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}`,
	'css'
)}

**Note:** These are example color tokens. Customize them to match your brand and design system. ###
Step 3: Configure Component Preset Set up global component presets for consistent styling:

{codeBlock(
	`// src/preset.ts
import { setPreset } from '@svelte-atoms/core/context';

setPreset({
  button: () => ({
    class: 'inline-flex items-center justify-center rounded-md font-medium transition-colors'
  }),
  card: () => ({
    class: 'rounded-lg border bg-card text-card-foreground shadow-sm'
  }),
  'card.header': () => ({
    class: 'flex flex-col space-y-1.5 p-6'
  }),
  'card.title': () => ({
    class: 'text-2xl font-semibold leading-none tracking-tight'
  }),
  'card.body': () => ({
    class: 'p-6 pt-0'
  })
});`,
	'typescript'
)}

Then import this preset in your root layout:

{codeBlock(
	`<!-- src/routes/+layout.svelte -->
<script>
  import '@svelte-atoms/core/styles/internal.css';
  import '../preset';
</script>

<slot />`,
	'svelte'
)}

## Your First Component Now you're ready to use Svelte Atoms components! Here's a simple example:

{codeBlock(
	`<!-- src/routes/+page.svelte -->
<script>
  import { Button } from '@svelte-atoms/core/components/button';
  import { Card } from '@svelte-atoms/core/components/card';
  
  let count = $state(0);
</script>

<Card.Root class="max-w-md mx-auto mt-8">
  <Card.Header>
    <Card.Title>Welcome to Svelte Atoms</Card.Title>
  </Card.Header>
  
  <Card.Body>
    <p class="text-muted-foreground mb-4">
      You've successfully set up Svelte Atoms! Click the button to increment the counter.
    </p>
    
    <div class="flex items-center gap-4">
      <Button onclick={() => count++}>
        Clicked {count} {count === 1 ? 'time' : 'times'}
      </Button>
    </div>
  </Card.Body>
</Card.Root>`,
	'svelte'
)}

**Success!** You now have a working Svelte Atoms setup. The button and card will use the presets you
configured. ## Next Steps

{#each metadata.nextSteps as step, i (i)}
	### {step.title}

	{step.description}

	[Learn more]({step.link})
{/each}

## Common Issues ### Styles Not Applying **Problem:** Components render but have no styles.
**Solution:** - Ensure you imported {inlineCode('@svelte-atoms/core/styles/internal.css')} in your root
layout - Verify Tailwind CSS is configured correctly - Check that CSS variables are defined in your {inlineCode(
	'app.css'
)}

### Type Errors **Problem:** TypeScript shows errors for component props. **Solution:** - Make sure
you're using TypeScript 5.0 or higher - Verify Svelte 5 is installed ({inlineCode('^5.0.0')}) -
Check that your {inlineCode('svelte.config.js')} is configured for TypeScript ### Import Errors **Problem:**
Can't import components or utilities. **Solution:** - Ensure {inlineCode('@svelte-atoms/core')} is installed
correctly - Try deleting {inlineCode('node_modules')} and reinstalling - Check your package manager version
### Preset Not Working **Problem:** Preset styles aren't applied to components. **Solution:** - Verify
you're importing your preset file in the root layout - Check that {inlineCode('setPreset')} is called
before components are rendered - Ensure components have the correct {inlineCode('preset')} prop value
## Additional Setup ### Dark Mode To support dark mode, add a class toggle to your root component:

{codeBlock(
	`<script>
  let darkMode = $state(false);
</script>

<div class={darkMode ? 'dark' : ''}>
  <slot />
</div>

<button onclick={() => darkMode = !darkMode}>
  Toggle Dark Mode
</button>`,
	'svelte'
)}

### Custom Fonts Add custom fonts to your {inlineCode('app.css')}:

{codeBlock(
	`@import 'tailwindcss';
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@layer base {
  body {
    font-family: 'Inter', sans-serif;
  }
}`,
	'css'
)}

### Tailwind Configuration Extend Tailwind to include additional utilities:

{codeBlock(
	`// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... other color tokens
      }
    }
  }
};`,
	'javascript'
)}

## Examples ### Button Variants

{codeBlock(
	`<script>
  import { Button } from '@svelte-atoms/core/components/button';
</script>

<div class="flex gap-2">
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
</div>`,
	'svelte'
)}

### Form Example

{codeBlock(
	`<script>
  import { Form } from '@svelte-atoms/core/components/form';
  import { Input } from '@svelte-atoms/core/components/input';
  import { Label } from '@svelte-atoms/core/components/label';
  import { Button } from '@svelte-atoms/core/components/button';
  
  let email = $state('');
  
  function handleSubmit() {
    console.log('Email:', email);
  }
</script>

<Form.Root onsubmit={handleSubmit}>
  <Form.Field>
    <Label for="email">Email</Label>
    <Input id="email" type="email" bind:value={email} />
    <Form.Description>
      We'll never share your email.
    </Form.Description>
  </Form.Field>
  
  <Button type="submit">Submit</Button>
</Form.Root>`,
	'svelte'
)}

### Dialog Example

{codeBlock(
	`<script>
  import { Dialog } from '@svelte-atoms/core/components/dialog';
  import { Button } from '@svelte-atoms/core/components/button';
  
  let open = $state(false);
</script>

<Button onclick={() => open = true}>
  Open Dialog
</Button>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Welcome</Dialog.Title>
      <Dialog.Description>
        This is a dialog component from Svelte Atoms.
      </Dialog.Description>
    </Dialog.Header>
    
    <Dialog.Footer>
      <Button variant="outline" onclick={() => open = false}>
        Cancel
      </Button>
      <Button onclick={() => open = false}>
        Confirm
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>`,
	'svelte'
)}

## Tips for Success 1. **Start Simple**: Begin with basic components and gradually add complexity 2.
**Use Presets**: Set up global presets early for consistent styling 3. **Leverage TypeScript**: Take
advantage of full type safety and autocomplete 4. **Read the Docs**: Explore component documentation
for all available options 5. **Check Examples**: Look at example code for common patterns and use
cases 6. **Customize Gradually**: Start with defaults and customize as you understand the system 7.
**Use Dev Tools**: Browser DevTools help debug styles and component structure ## Resources -
[Component Library](/docs/components) - Browse all available components -
[Philosophy](/docs/philosophy) - Understand the design principles - [Styling Guide](/docs/styling) -
Learn the styling system - [Preset System](/docs/preset) - Learn about global theming -
[Accessibility](/docs/accessibility) - Build accessible applications - [GitHub
Repository](https://github.com/svelte-atoms/core) - Source code and issues ## Get Help If you run
into issues: 1. Check the [Component Documentation](/docs/components) 2. Search [GitHub
Issues](https://github.com/svelte-atoms/core/issues) 3. Join the community discussions 4. Read the
troubleshooting guide Happy building with Svelte Atoms! 🚀
