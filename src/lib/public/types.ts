// Curated application-facing type surface for the package root. Keep these exports explicit:
// component facades also expose runtime and extension internals that do not belong at the root.
export type { StateChangeCallback, StateChangeContext } from '$ixirjs/ui/types';

export type {
	AccordionChildren,
	AccordionItemPresets,
	AccordionPresets,
	AccordionItemBodyProps,
	AccordionItemChildren,
	AccordionItemHeaderProps,
	AccordionItemIndicatorProps,
	AccordionItemRootProps,
	AccordionItemSnippetProps,
	AccordionRootProps,
	AccordionSnippetProps
} from './components/accordion';

export type {
	AlertActionsProps,
	AlertChildren,
	AlertCloseButtonProps,
	AlertContentProps,
	AlertDescriptionProps,
	AlertIconProps,
	AlertRootProps,
	AlertSnippetProps,
	AlertTitleProps
} from './components/alert';

export type { HtmlAtomProps } from './components/atom';
export type { AvatarProps } from './components/avatar';
export type { BadgeChildren, BadgeProps, BadgeSnippetProps } from './components/badge';
export type {
	BreadcrumbItemProps,
	BreadcrumbRootProps,
	BreadcrumbSeparatorProps
} from './components/breadcrumb';
export type { ButtonProps } from './components/button';

export type {
	CalendarChildren,
	CalendarDayProps,
	CalendarRange,
	CalendarRootProps,
	CalendarSnippetProps,
	Day,
	Month
} from './components/calendar';

export type {
	CardBodyProps,
	CardChildren,
	CardContentProps,
	CardDescriptionProps,
	CardFooterProps,
	CardHeaderProps,
	CardMediaProps,
	CardRootProps,
	CardSnippetProps,
	CardSubtitleProps,
	CardTitleProps
} from './components/card';

export type { CheckboxChildren, CheckboxProps, CheckboxSnippetProps } from './components/checkbox';
export type {
	ChipChildren,
	ChipCloseButtonProps,
	ChipProps,
	ChipSnippetProps
} from './components/chip';

export type {
	CollapsibleBodyProps,
	CollapsibleChildren,
	CollapsibleHeaderProps,
	CollapsibleIndicatorProps,
	CollapsibleRootProps,
	CollapsibleSnippetProps
} from './components/collapsible';

export type {
	ComboboxChildren,
	ComboboxControlProps,
	ComboboxItemProps,
	ComboboxRootProps,
	ComboboxSelection,
	ComboboxSelectionProps,
	ComboboxSelectionsProps,
	ComboboxSnippetProps,
	ComboboxTriggerProps
} from './components/combobox';

export type {
	ContainerChildren,
	ContainerProps,
	ContainerSnippetProps
} from './components/container';

export type {
	ContextMenuContentProps,
	ContextMenuDividerProps,
	ContextMenuGroupProps,
	ContextMenuIndicatorProps,
	ContextMenuItemProps,
	ContextMenuRootProps,
	ContextMenuTailProps,
	ContextMenuTitleProps,
	ContextMenuTriggerProps
} from './components/context-menu';

export type {
	DatagridBodyProps,
	DatagridCellProps,
	DatagridCheckboxProps,
	DatagridChildren,
	DatagridColumnChildren,
	DatagridColumnProps,
	DatagridColumnSnippetProps,
	DatagridFooterProps,
	DatagridHeaderProps,
	DatagridRootProps,
	DatagridRowChildren,
	DatagridRowProps,
	DatagridRowSnippetProps,
	DatagridSnippetProps,
	Direction,
	SortBy,
	SortableType
} from './components/datagrid';

export type {
	DatePickerCalendarProps,
	DatePickerPresets,
	DatePickerChildren,
	DatePickerHeaderProps,
	DatePickerMonthsProps,
	DatePickerRootProps,
	DatePickerSnippetProps,
	DatePickerYearsProps
} from './components/date-picker';

export type {
	DialogBodyProps,
	DialogChildren,
	DialogCloseButtonProps,
	DialogContentProps,
	DialogDescriptionProps,
	DialogFooterProps,
	DialogHeaderProps,
	DialogProps,
	DialogSnippetProps,
	DialogTitleProps
} from './components/dialog';

export type { DividerProps } from './components/divider';

export type {
	DrawerBodyProps,
	DrawerChildren,
	DrawerSnippetProps,
	SlideoverBackdropProps,
	SlideoverContentProps,
	SlideoverDescriptionProps,
	SlideoverFooterProps,
	SlideoverHeaderProps,
	SlideoverRootProps,
	SlideoverTitleProps
} from './components/drawer';

export type {
	DropdownMenuItemProps,
	DropdownMenuContentProps,
	DropdownMenuRootProps
} from './components/dropdown-menu';

// ElementType is exported from this facade only; the Atom facade re-exports the same name.
export type {
	ElementAttributes,
	ElementProps,
	ElementTagName,
	ElementType,
	HtmlElementAttributes,
	HtmlElementEventProps,
	HtmlElementProps,
	HtmlElementTagName,
	HtmlElementType,
	Motion,
	NodeFunction,
	ScaleFadeParams,
	SvgElementProps,
	SvgElementTagName,
	SvgElementType,
	TransitionFunction
} from './components/element';

// Field types are exported through both form facades. Export the canonical declarations once.
export type {
	FieldChildren,
	FieldControlChangeDetails,
	FieldControlProps,
	FieldHelperTextProps,
	FieldLabelProps,
	FieldRootProps,
	FieldSnippetProps,
	FieldTextProps,
	FormChildren,
	FormRootProps,
	FormSnippetProps,
	ValidationAdapter,
	ValidationError,
	ValidationResult
} from './components/form';

export type { IconChildren, IconProps, IconSnippetProps } from './components/icon';
export type { ImageProps } from './components/image';

export type {
	HourAmPmDigits,
	HourDigits,
	InputChildren,
	InputColorControlProps,
	InputControlChangeDetails,
	InputControlProps,
	InputControlType,
	InputCurrencyControlProps,
	InputDateControlProps,
	InputDateTimeControlProps,
	InputEmailControlProps,
	InputFileControlProps,
	InputLocationControlProps,
	InputNumber12HourControlProps,
	InputNumber24HourControlProps,
	InputNumberControlProps,
	InputOtpControlProps,
	InputPasswordControlProps,
	InputPhoneControlProps,
	InputRootProps,
	InputSnippetProps,
	InputStateChangeCallback,
	InputTextControlProps,
	InputTimeControlProps,
	InputUrlControlProps,
	MinuteDigits,
	PhoneSpan,
	PhoneSpanType,
	SecondDigits,
	Time,
	TimeFull
} from './components/input';

export type { KbdProps, ShortcutProps } from './components/kbd';
export type { LabelChildren, LabelProps, LabelSnippetProps } from './components/label';
export type { LazyChildren, LazyOwnProps, LazyProps, LazySnippetProps } from './components/lazy';
export type { LinkChildren, LinkProps, LinkSnippetProps } from './components/link';

export type {
	ListChildren,
	ListDividerProps,
	ListGroupProps,
	ListItemProps,
	ListRootProps,
	ListSnippetProps,
	ListTitleProps
} from './components/list';

export type {
	PopoverDialogContentProps,
	PopoverDialogRootProps
} from './components/popover-dialog';

export type {
	AnchorSize,
	AnchorSizeFn,
	AnchorTriggerSize,
	PopoverChildren,
	PopoverContentProps,
	PopoverIndicatorProps,
	PopoverOverlayProps,
	PopoverRootProps,
	PopoverTailProps,
	PopoverTriggerProps
} from './components/popover';

export type {
	ActivePortalProps,
	LayerInput,
	LayerName,
	LayerRelation,
	PortalChildren,
	PortalId,
	PortalOuterProps,
	PortalSnippetProps,
	PortalSurfaceChildren,
	PortalSurfaceProps,
	PortalTarget,
	TeleportProps,
	ZIndexInput
} from './components/portal';

export type { ProgressCircularProps, ProgressLinearProps } from './components/progress';
export type { QRCodeProps } from './components/qr-code';
export type {
	RadioChildren,
	RadioGroupProps,
	RadioProps,
	RadioSnippetProps
} from './components/radio';
export type { RootChildren, RootPortals, RootProps, RootSnippetProps } from './components/root';

export type {
	ScrollableChildren,
	ScrollableContainerProps,
	ScrollableContentProps,
	ScrollableRootProps,
	ScrollableSnippetProps,
	ScrollableThumbProps,
	ScrollableTrackProps
} from './components/scrollable';

export type {
	SelectChildren,
	SelectItemProps,
	SelectQueryProps,
	SelectRootProps,
	SelectSelection,
	SelectSelectionHandle,
	SelectSelectionProps,
	SelectSelectionsProps,
	SelectSnippetProps,
	SelectTriggerProps
} from './components/select';

export type {
	SidebarChildren,
	SidebarContentProps,
	SidebarRootProps,
	SidebarSnippetProps
} from './components/sidebar';

export type {
	SliderProps,
	SliderResolvedPartProps,
	SliderThumbContentProps,
	SliderTrackContentProps,
	SliderValueChangeCallback,
	SliderValueChangeDetails
} from './components/slider';

export type {
	StackChildren,
	StackItemProps,
	StackRootProps,
	StackSnippetProps
} from './components/stack';

export type {
	StepBodyProps,
	StepChildren,
	StepContentProps,
	StepDescriptionProps,
	StepHeaderProps,
	StepIndicatorProps,
	StepRootProps,
	StepSeparatorProps,
	StepSnippetProps,
	StepTitleProps,
	StepperBodyProps,
	StepperChildren,
	StepperContentProps,
	StepperFooterProps,
	StepperHeaderProps,
	StepperRootProps,
	StepperSnippetProps
} from './components/stepper';

export type { SwatchProps } from './components/swatch';
export type { SwitchProps, SwitchThumbSnippetProps } from './components/switch';

export type {
	TabBodyProps,
	TabPresets,
	TabRootProps,
	TabChildren,
	TabDescriptionProps,
	TabHeaderProps,
	TabSnippetProps,
	TabsBodyProps,
	TabsChildren,
	TabsContentProps,
	TabsHeaderProps,
	TabsPresets,
	TabsRootProps,
	TabsSnippetProps
} from './components/tabs';

export type {
	TextareaChildren,
	TextareaInputProps,
	TextareaRootProps,
	TextareaSnippetProps
} from './components/textarea';

export type {
	ToastChildren,
	ToastCloseProps,
	ToastDescriptionProps,
	ToastItem,
	ToastOptions,
	ToastRootProps,
	ToastSnippetProps,
	ToastTitleProps,
	ToastType
} from './components/toast';

export type {
	TooltipChildren,
	TooltipRootProps,
	TooltipSnippetProps,
	TooltipTriggerProps
} from './components/tooltip';

export type {
	TreeBodyProps,
	TreePresets,
	TreeHeaderProps,
	TreeIndicatorProps,
	TreeRootProps
} from './components/tree';
