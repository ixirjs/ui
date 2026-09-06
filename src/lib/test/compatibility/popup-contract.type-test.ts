import type { PopupBond } from '@ixirjs/ui/experimental';
import type { ComboboxBond } from '@ixirjs/ui/components/combobox';
import type { DatePickerBond } from '@ixirjs/ui/components/date-picker';

// The former Pick<PopupBond, ...> contract and its independent replacement agree on
// every member. This protects writable/readonly distinctions as well as signatures.
type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
type MenuKeys =
	| 'items'
	| 'roving'
	| 'typeahead'
	| 'ariaHasPopup'
	| 'triggerToggles'
	| 'contentRole'
	| 'contentAttrs'
	| 'navigableItems'
	| 'itemText'
	| 'itemDomId'
	| 'registerItem'
	| 'unregisterItem'
	| 'mountItem'
	| 'unmountItem'
	| 'item';
type SelectionKeys = 'selection' | 'selections' | 'select' | 'unselect';
type InputKeys = 'input' | 'userSelections' | 'allSelections' | 'addSelection' | 'deleteSelection';
type DateKeys =
	| 'formattedValue'
	| 'hasValue'
	| 'isYearsPickerOpen'
	| 'isMonthsPickerOpen'
	| 'formatDate'
	| 'selectDate'
	| 'selectStart'
	| 'selectEnd'
	| 'clear'
	| 'openYearsPicker'
	| 'closeYearsPicker'
	| 'toggleYearsPicker'
	| 'openMonthsPicker'
	| 'closeMonthsPicker'
	| 'toggleMonthsPicker';
export type MenuParity = Assert<Equal<Pick<ComboboxBond, MenuKeys>, Pick<PopupBond, MenuKeys>>>;
export type SelectionParity = Assert<
	Equal<Pick<ComboboxBond, SelectionKeys>, Pick<PopupBond, SelectionKeys>>
>;
export type InputParity = Assert<Equal<Pick<ComboboxBond, InputKeys>, Pick<PopupBond, InputKeys>>>;
export type DateParity = Assert<Equal<Pick<DatePickerBond, DateKeys>, Pick<PopupBond, DateKeys>>>;

import { CardBond } from '@ixirjs/ui/experimental';
import type { CardRootProps, CardSnippetProps } from '@ixirjs/ui/components/card';

class CustomCard extends CardBond {
	override get isClickable(): boolean {
		return true;
	}
}
export const customFactory: NonNullable<CardRootProps['factory']> = (props) =>
	new CustomCard(props);
export function existingState(state: CardSnippetProps['card']): CardBond {
	return state;
}
