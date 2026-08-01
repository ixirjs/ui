import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import RadioCallbackTest from '$ixirjs/ui/test/components/radio/radio-callback.test.svelte';

describe('Radio callbacks', () => {
	it('commits item and group state without fabricating group events', async () => {
		const oncheckedchange = vi.fn();
		const onpreviouscheckedchange = vi.fn();
		const onvaluechange = vi.fn();
		const oniteminput = vi.fn();
		const onitemchange = vi.fn();
		const ongroupinput = vi.fn();
		render(RadioCallbackTest, {
			oncheckedchange,
			onpreviouscheckedchange,
			onvaluechange,
			oniteminput,
			onitemchange,
			ongroupinput
		});

		expect(oncheckedchange).not.toHaveBeenCalled();
		expect(onpreviouscheckedchange).not.toHaveBeenCalled();
		expect(onvaluechange).not.toHaveBeenCalled();

		const inputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]');
		inputs[1]!.click();

		const inputEvent = oniteminput.mock.calls[0]?.[0];
		const changeEvent = onitemchange.mock.calls[0]?.[0];
		expect(inputEvent).toBeInstanceOf(Event);
		expect(inputEvent).not.toBeInstanceOf(CustomEvent);
		expect(changeEvent).toBeInstanceOf(Event);
		expect(oniteminput.mock.calls[0]).toEqual([inputEvent]);
		expect(onitemchange.mock.calls[0]).toEqual([changeEvent]);
		expect(ongroupinput.mock.calls[0]).toEqual([inputEvent]);
		expect(onvaluechange).toHaveBeenCalledOnce();
		expect(onvaluechange).toHaveBeenCalledWith('beta', { event: inputEvent });
		expect(onpreviouscheckedchange).toHaveBeenCalledOnce();
		expect(onpreviouscheckedchange).toHaveBeenCalledWith(false, { event: inputEvent });
		expect(oncheckedchange).toHaveBeenCalledOnce();
		expect(oncheckedchange).toHaveBeenCalledWith(true, { event: inputEvent });
		await expect.element(page.getByTestId('radio-value')).toHaveTextContent('beta');
		await expect.element(page.getByTestId('radio-item-committed')).toHaveTextContent('true,true');
		await expect.element(page.getByTestId('radio-group-committed')).toHaveTextContent('true');
	});

	it('reports both sides of a standalone bind:group transition', async () => {
		const onstandalonecheckedchange = vi.fn();
		const onstandalonepreviouscheckedchange = vi.fn();
		const onstandaloneinput = vi.fn();
		render(RadioCallbackTest, {
			onstandalonecheckedchange,
			onstandalonepreviouscheckedchange,
			onstandaloneinput
		});

		expect(onstandalonecheckedchange).not.toHaveBeenCalled();
		expect(onstandalonepreviouscheckedchange).not.toHaveBeenCalled();

		const inputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]');
		inputs[3]!.click();
		await expect.element(page.getByTestId('radio-standalone-value')).toHaveTextContent('beta');

		const inputEvent = onstandaloneinput.mock.calls[0]?.[0];
		expect(onstandaloneinput.mock.calls[0]).toEqual([inputEvent]);
		expect(onstandalonecheckedchange).toHaveBeenCalledWith(true, { event: inputEvent });
		expect(onstandalonepreviouscheckedchange).toHaveBeenCalledWith(false, {});
		await expect
			.element(page.getByTestId('radio-standalone-committed'))
			.toHaveTextContent('true,true');
	});
});
