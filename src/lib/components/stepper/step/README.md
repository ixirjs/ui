# Step

The Step component represents an individual step within a Stepper workflow. It manages its own state (active, completed, disabled, optional) and provides a composable structure for building step indicators, headers, and content.

## Usage

Steps are typically used within a `Stepper.Root` component to create multi-step workflows. Each step can display an indicator, title, description, and content.

```svelte
<script>
  import { Stepper, Step } from '@svelte-atoms/core';
</script>

<Stepper.Root>
  <Step.Root index={0} header="Account Setup" body="Create your account">
    {#snippet children({ step })}
      <Step.Header>
        <Step.Indicator />
        <Step.Separator />
        
        <div>
          <Step.Title>Account Setup</Step.Title>
          <Step.Description>Create your account</Step.Description>
        </div>
      </Step.Header>
      
      <Step.Body>
        <!-- Step content goes here -->
      </Step.Body>
    {/snippet}
  </Step.Root>
</Stepper.Root>
```

## Components

### Step.Root

The root container for a step. Manages step state and provides context to child components.

**Props:**
- `index` - Step index in the stepper sequence
- `header` - Step header text
- `body` - Step body/description text
- `optional` - Whether the step is optional
- `disabled` - Whether the step is disabled

### Step.Header

Container for the step's header section, typically containing the indicator, title, and description.

### Step.Indicator

Visual indicator showing the step's state (number, icon, checkmark for completed steps).

### Step.Separator

Visual separator line between step indicators, typically used in horizontal steppers.

### Step.Title

The main title/label for the step.

### Step.Description

Secondary description or subtitle for the step.

### Step.Body

Container for the step's main content area. This content is rendered when the step is active.

## Step States

Each step can be in one of several states:

- **Active** - Currently visible/selected step
- **Completed** - Step that has been completed
- **Disabled** - Step that cannot be accessed
- **Optional** - Step that can be skipped
- **Pending** - Step that hasn't been reached yet

## Integration

Steps work seamlessly with the Stepper component's navigation system. The step's state is automatically managed based on the active step index and user interactions.

```svelte
<Step.Root index={0}>
  {#snippet children({ step })}
    {@const isActive = step?.state?.isActive}
    {@const isCompleted = step?.state?.isCompleted}
    
    <Step.Title class={isActive ? 'font-bold' : ''}>
      Step 1
    </Step.Title>
  {/snippet}
</Step.Root>
```
