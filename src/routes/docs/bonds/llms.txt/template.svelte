<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
  import { FrontMatter } from '$docs/md/components';
  import { codeBlock, list } from '$docs/md/template';

  let { data } = $props();
  const { metadata, frontmatter } = $derived(data);
</script>
	// eslint-disable-next-line @typescript-eslint/no-unused-vars

<FrontMatter {frontmatter} />


# {metadata.pageTitle}

{metadata.pageDescription}

## Overview

{metadata.overview}

Bonds are the foundation for complex components in Svelte Atoms. They encapsulate state, behavior, and element management in a type-safe, reactive way. Think of bonds as intelligent glue that connects component state to DOM elements while handling all the complexity of ARIA attributes, focus management, and event coordination.

## Key Features

{list(metadata.keyFeatures)}

## Bond Architecture

{#each metadata.architecture as arch, i (i)}
### {arch.component}

{arch.description}

**Responsibilities:**
{list(arch.responsibilities)}

{/each}

## Creating a Bond

### Step 1: Define Props Type

{codeBlock(`
import { BondStateProps } from '@svelte-atoms/core';

// Define the props type for your bond state
export type MyComponentStateProps = BondStateProps & {
  open: boolean;
  disabled: boolean;
  // Add your component-specific props
};
`, 'typescript')}

### Step 2: Define DOM Elements

{codeBlock(`// Define the HTML elements your bond will manage
export type MyComponentDomElements = {
  root: HTMLElement;
  trigger: HTMLElement;
  content: HTMLElement;
  // Add your component-specific elements
};`, 'typescript')}

### Step 3: Create BondState Class

{codeBlock(`import { BondState } from '@svelte-atoms/core';

// Create the BondState class to manage reactive state
export class MyComponentState<
  Props extends MyComponentStateProps = MyComponentStateProps
> extends BondState<Props> {
  constructor(props: () => Props) {
    super(props);
  }
  
  // Derived state using $derived rune
  get isOpen() {
    return this.props.open;
  }
  
  // Methods to modify state
  open() {
    this.props.open = true;
  }
  
  close() {
    this.props.open = false;
  }
  
  toggle() {
    this.props.open = !this.props.open;
  }
}`, 'typescript')}

### Step 4: Create Bond Class

{codeBlock(`import { Bond } from '@svelte-atoms/core';
import { getContext, setContext } from 'svelte';

// Create the Bond class to manage elements and props
export class MyComponentBond<
  Props extends MyComponentStateProps = MyComponentStateProps,
  State extends MyComponentState<Props> = MyComponentState<Props>,
  Elements extends MyComponentDomElements = MyComponentDomElements
> extends Bond<Props, State, Elements> {
  static CONTEXT_KEY = '@your-app/bonds/my-component';
  
  constructor(state: State) {
    super(state);
  }
  
  // Generate props for root element
  root() {
    return {
      id: this.ids.root,
      'data-component': 'my-component',
      'aria-expanded': this.state.isOpen
    };
  }
  
  // Generate props for trigger element
  trigger() {
    return {
      id: this.ids.trigger,
      'aria-controls': this.ids.content,
      'aria-expanded': this.state.isOpen,
      onclick: () => this.state.toggle()
    };
  }
  
  // Generate props for content element
  content() {
    return {
      id: this.ids.content,
      'aria-labelledby': this.ids.trigger,
      hidden: !this.state.isOpen
    };
  }
  
  // Share bond via context for compound components
  share(): this {
    return MyComponentBond.set(this) as this;
  }
  
  // Context helpers
  static override get(): MyComponentBond {
    return getContext(MyComponentBond.CONTEXT_KEY);
  }
  
  static override set(bond: MyComponentBond) {
    return setContext(MyComponentBond.CONTEXT_KEY, bond);
  }
}`, 'typescript')}

### Step 5: Use in Component

{codeBlock(`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
  import { MyComponentBond, MyComponentState } from './bond.svelte';
  import { defineState, defineProperty } from '@svelte-atoms/core/utils';

  let { open = $bindable(false), disabled = false } = $props();

  // Wrap bindables as reactive prop cells, then create the bond state
  const bondProps = defineState<MyComponentStateProps>([
    defineProperty('open', () => open, (v) => { open = v; }),
    defineProperty('disabled', () => disabled)
  ]);
  const bondState = new MyComponentState(bondProps);
  
  // Create and share bond for compound components
  const bond = new MyComponentBond(bondState).share();
</script>

<!-- Root component spreads bond props -->
<div {...bond.root()}>
  <button {...bond.trigger()}>
    Toggle Content
  </button>
  
  <div {...bond.content()}>
    Content goes here
  </div>
</div>`, 'svelte')}

## Bond Patterns

{#each metadata.bondPatterns as pattern, i (i)}
### {pattern.title}

{pattern.description}

**Use Case:** {pattern.useCase}

{/each}

## Advanced Examples

### Reactive Props with defineState

{codeBlock(`import { defineState, defineProperty } from '@svelte-atoms/core/utils';

let open = $bindable(false);

// Create reactive props with bindables
const bondProps = defineState<DialogBondProps>([
  defineProperty('open', () => open, (v) => (open = v))
], () => ({
  disabled: false  // Static defaults only — frozen snapshot, not reactive
}));

const state = new DialogBondState(bondProps);`, 'typescript')}

### Element Props with Spread

{codeBlock(`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
  const bond = new DialogBond(state).share();
</script>

<!-- Spread bond props onto elements -->
<div {...bond.root()}>
  <h2 {...bond.title()}>Dialog Title</h2>
  <div {...bond.body()}>Content</div>
</div>`, 'svelte')}

### Accessing Bond from Children

{codeBlock(`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
  // In child component, retrieve parent bond
  const bond = DialogBond.get();
  
  function handleClick() {
    bond?.state.close();
  }
</script>

<button onclick={handleClick}>
  {bond?.state.props.open ? 'Close' : 'Open'}
</button>`, 'svelte')}

### Bond Factories

{codeBlock(`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
  import { createTreeBond } from './factory';
  
  let { 
    factory = createTreeBond,
    open = $bindable(false)
  } = $props();
  
  const bondProps = defineState(...);
  
  // Use factory (allows customization)
  const bond = factory(bondProps).share();
  
  function defaultFactory(props) {
    const state = new TreeState(props);
    return new TreeBond(state);
  }
</script>`, 'svelte')}

### Imperative Bond Access

{codeBlock(`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
  import { TreeRoot } from './components';
  
  let treeRef: TreeRoot;
  
  function handleClick() {
    // Access bond imperatively via component reference
    treeRef?.bond?.state.expandAll();
  }
</script>

<TreeRoot bind:this={treeRef} />
<button onclick={handleClick}>Toggle Tree</button>`, 'svelte')}

## Type Safety

Bonds are fully type-safe with TypeScript:

{codeBlock(`// Props are strongly typed
type MyProps = BondStateProps & {
  value: string;
  onChange: (value: string) => void;
};

// Elements are strongly typed
type MyElements = {
  root: HTMLDivElement;
  input: HTMLInputElement;
};

// Bond methods return typed props
class MyBond extends Bond<MyProps, MyState, MyElements> {
  input() {
    return {
      value: this.state.props.value,
      oninput: (e) => {
        // TypeScript knows e.currentTarget is HTMLInputElement
        this.state.props.onChange(e.currentTarget.value);
      }
    };
  }
}`, 'typescript')}

## Performance Considerations

Bonds are designed for optimal performance:

1. **Fine-grained Reactivity**: Props passed as functions enable precise dependency tracking
2. **Memoization**: Derived state is automatically memoized with $derived
3. **Lazy Evaluation**: Props objects are only created when accessed
4. **Minimal Re-renders**: Only components that use tracked state re-render
5. **Element Attachments**: Automatic element tracking without manual refs

## Common Patterns

### Dialog/Modal Bond

{codeBlock(`class DialogState extends BondState<DialogProps> {
  get isOpen() { return this.props.open; }
  open() { this.props.open = true; }
  close() { this.props.open = false; }
}

class DialogBond extends Bond<DialogProps, DialogState, DialogElements> {
  root() {
    return {
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': this.ids.title
    };
  }
  
  overlay() {
    return {
      onclick: () => this.state.close()
    };
  }
}`, 'typescript')}

### Tabs Bond

{codeBlock(`class TabsState extends BondState<TabsProps> {
  #items = new SvelteMap<string, TabBond>();
  #selectedItem = $derived(this.#items.get(this.props.value));
  
  get selectedItem() { return this.#selectedItem; }
  
  select(id: string) {
    this.props.value = id;
  }
  
  registerTab(id: string, bond: TabBond) {
    this.#items.set(id, bond);
  }
}`, 'typescript')}

### Accordion Bond

{codeBlock(`class AccordionState extends BondState<AccordionProps> {
  #openItems = $state<Set<string>>(new Set());
  
  isOpen(id: string) {
    return this.#openItems.has(id);
  }
  
  toggle(id: string) {
    if (this.props.multiple) {
      this.#openItems.has(id) 
        ? this.#openItems.delete(id) 
        : this.#openItems.add(id);
    } else {
      this.#openItems.clear();
      this.#openItems.add(id);
    }
  }
}`, 'typescript')}

## Best Practices

1. **Use Functions for Props**: Pass props as functions for optimal reactivity
2. **Keep State Minimal**: Only store what's necessary in bond state
3. **Derive When Possible**: Use $derived for computed values
4. **Share via Context**: Use context for compound components
5. **Type Everything**: Leverage TypeScript for all bond definitions
6. **Generate Element Props**: Let bonds handle ARIA and event binding
7. **Test Bonds Separately**: Unit test bond logic independent of components
8. **Document Public API**: Clearly document bond methods and properties

## Debugging Bonds

{codeBlock(`class MyBond extends Bond<Props, State, Elements> {
  // Add debug helpers
  debug() {
    console.log('Bond State:', this.state.props);
    console.log('Elements:', this.elements);
    console.log('IDs:', this.ids);
  }
  
  // Override methods for logging
  override root() {
    const props = super.root();
    console.log('Root props:', props);
    return props;
  }
}`, 'typescript')}

## Migration from Other Patterns

### From Props Drilling

{codeBlock(`<!-- Before: Props drilling -->
<Parent>
  <Child {parentState} {onUpdate} />
  <Grandchild {parentState} {onUpdate} />
</Parent>

<!-- After: Bond with context -->
<Parent>
  <Child />  <!-- Accesses bond via context -->
  <Grandchild />  <!-- No prop drilling -->
</Parent>`, 'svelte')}

### From Global Stores

{codeBlock(`<!-- Before: Global store -->
<script>
  import { dialogStore } from './stores';
</script>

<!-- After: Scoped bond -->
<script>
  const bond = new DialogBond(state);
</script>`, 'svelte')}

## Next Steps

- Learn about [Atoms](/docs/atoms) - the components that use bonds
- Explore [Component Examples](/docs/components) to see bonds in action
- Read the [Philosophy](/docs/philosophy) to understand the design decisions
- Check out [Advanced Patterns](/docs/advanced) for complex use cases
