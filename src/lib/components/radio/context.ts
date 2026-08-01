import { getContext, setContext } from 'svelte';

export const RADIO_GROUP_CONTEXT_KEY = '@atoms/context/radio/group';

export type RadioGroupContext = {
	disabled: boolean;
	required: boolean;
	readonly: boolean;
	name?: string;
	value?: string;
};

export function getRadioGroupContext(): RadioGroupContext {
	return getContext(RADIO_GROUP_CONTEXT_KEY);
}

export function setRadioGroupContext(context: RadioGroupContext): RadioGroupContext {
	return setContext(RADIO_GROUP_CONTEXT_KEY, context);
}
