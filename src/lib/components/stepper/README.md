# Stepper

Multi-step workflow components.

## Parts

| Namespace | Parts                                                                      |
| --------- | -------------------------------------------------------------------------- |
| `Stepper` | `Root`, `Header`, `Body`, `Content`, `Footer`                              |
| `Step`    | `Root`, `Header`, `Title`, `Description`, `Indicator`, `Separator`, `Body` |

## Notes

- `Stepper.Root` owns the active `step` index, `linear`, `disabled`, and `orientation` props.
- `Step.Body` registers content; `Stepper.Content` renders the active registered body.
- Step state includes active, completed, disabled, optional, and pending.
