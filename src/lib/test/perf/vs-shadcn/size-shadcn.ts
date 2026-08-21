// Bundle-size probe: the shadcn-svelte / bits-ui side of the same five families. The menu and
// accordion pull bits-ui in; card, button and table are vendored source plus `cn()`.
import * as Card from '$shadcn/shadcn/card/index.js';
import { Button } from '$shadcn/shadcn/button/index.js';
import * as Accordion from '$shadcn/shadcn/accordion/index.js';
import * as DropdownMenu from '$shadcn/shadcn/dropdown-menu/index.js';
import * as Table from '$shadcn/shadcn/table/index.js';

export const used = [
	Card.Root,
	Card.Header,
	Card.Title,
	Card.Content,
	Button,
	Accordion.Root,
	Accordion.Item,
	Accordion.Trigger,
	Accordion.Content,
	DropdownMenu.Root,
	DropdownMenu.Trigger,
	DropdownMenu.Content,
	DropdownMenu.Item,
	Table.Root,
	Table.Body,
	Table.Row,
	Table.Cell
];
