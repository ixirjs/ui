# Stepper

A flexible stepper component for building multi-step workflows, forms, and guided processes. The stepper module provides a complete set of composable components to create linear or non-linear step-based interfaces.

## Components

The stepper module consists of two main components and their sub-components:

### Stepper (Root Container)

The main container component that manages the overall stepper state and layout.

- **`Stepper.Root`** - The root stepper container
- **`Stepper.Header`** - Container for step indicators/navigation
- **`Stepper.Body`** - Container for step content
- **`Stepper.Content`** - Individual step content wrapper
- **`Stepper.Footer`** - Container for navigation buttons/actions

### Step (Individual Step)

Represents a single step in the workflow with its own state and content.

- **`Step.Root`** - The root step container
- **`Step.Header`** - Step header with title/indicator
- **`Step.Title`** - Step title text
- **`Step.Description`** - Step description/subtitle
- **`Step.Indicator`** - Visual step indicator (number, icon, status)
- **`Step.Separator`** - Visual separator between steps
- **`Step.Body`** - Step content area

## Features

- **Flexible Layout** - Horizontal or vertical orientation
- **State Management** - Built-in step state (active, completed, disabled, optional)
- **Navigation Control** - Linear or non-linear step progression
- **Composable** - Mix and match components to build custom steppers
- **Accessible** - ARIA attributes and keyboard navigation support
- **Customizable** - Full control over styling and behavior through the atoms system
