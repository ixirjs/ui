<script lang="ts">
	import { InputBond } from '@ixirjs/ui/experimental';

	const missing = InputBond.get() === undefined;
	let missingMessage = '';
	try {
		InputBond.getOrThrow('compat missing input');
	} catch (error) {
		missingMessage = (error as Error).message;
	}
	let result = $state('');

	function inspect() {
		const props = { id: 'compat-input', value: 0 };
		const input = InputBond.create(props);
		input.declareType(() => 'number');
		const numeric = [input.value.get(), input.number, input.shouldShowPlaceholder];
		input.setValue('');
		const empty = input.number === undefined;
		const files = [new File(['sample'], 'sample.txt')];
		input.setFiles(files);
		input.declareType(() => 'file');
		const fileState = [input.files === files, input.shouldShowPlaceholder];
		input.setChecked(true);
		input.declareType(() => 'checkbox');
		const checkbox = [input.props.checked, input.shouldShowPlaceholder];
		input.declareType(() => 'time');
		input.setValue('13:15');
		input.declareDate(new Date('2024-01-02T13:15:00Z'));
		const date = input.date;
		date?.setUTCFullYear(2000);
		result = JSON.stringify({
			missing,
			missingMessage,
			key: InputBond.CONTEXT_KEY,
			name: new InputBond().name,
			sameProps: input.props === props,
			ids: [input.id, input.rootId, input.controlId, input.placeholderId],
			numeric,
			empty,
			fileState,
			checkbox,
			type: input.controlType,
			dateIsCopy: date !== input.date,
			year: input.date?.getUTCFullYear()
		});
	}
</script>

<button data-testid="inspect-input-state" onclick={inspect}>Inspect input state</button>
<output data-testid="input-state-contract">{result}</output>
