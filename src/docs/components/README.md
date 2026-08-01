# Documentation Components

Reusable building blocks for component documentation pages.

## Main Exports

| Export              | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `PageHeader`        | Title, description, status, optional badges. |
| `Breadcrumb`        | Breadcrumb trail.                            |
| `Section`           | Titled content section.                      |
| `Installation`      | Install and import code blocks.              |
| `FeatureGrid`       | Feature summary grid.                        |
| `AccessibilityInfo` | Accessibility feature list.                  |
| `PageNavigation`    | Previous/next links.                         |
| `DemoExample`       | Preview/code example shell.                  |
| `Props`             | Props table.                                 |

## Dual-Mode Exports

`DocPage`, `DocSection`, `DocExample`, `DocProps`, `DocCalloutBlock`, `DocOnly`,
`DocInstallation`, `DocAccessibility`, `DocCode`, `DocComponentPage`, `DocPropsSection`, and
`DocPropsTabs`.

## Notes

- Import from `$docs/components`.
- `DemoExample` accepts `code`, `component`, or `children`.
- Shared doc metadata types are re-exported from this barrel.
