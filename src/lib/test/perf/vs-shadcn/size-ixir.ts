// Bundle-size probe: a realistic app slice, @ixirjs/ui side. Deliberately the SAME five families as
// `size-shadcn.ts` and nothing else — a size comparison over different component sets measures the
// sets. Everything is referenced through `used` so tree-shaking cannot drop it.
import { Card } from '$ixirjs/ui/components/card';
import { Button } from '$ixirjs/ui/components/button';
import { Accordion } from '$ixirjs/ui/components/accordion';
import { AccordionItem } from '$ixirjs/ui/components/accordion/item';
import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';
import { DataGrid } from '$ixirjs/ui/components/datagrid';

export const used = [
	Card.Root,
	Card.Header,
	Card.Title,
	Card.Body,
	Button,
	Accordion,
	AccordionItem.Root,
	AccordionItem.Header,
	AccordionItem.Body,
	DropdownMenu.Root,
	DropdownMenu.Trigger,
	DropdownMenu.Content,
	DropdownMenu.Item,
	DataGrid.Root,
	DataGrid.Body,
	DataGrid.Row,
	DataGrid.Cell
];
