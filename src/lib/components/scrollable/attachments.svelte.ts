import {
	createBondAttachment,
	type BondAttachment
} from '$ixirjs/ui/components/internal/attachments.svelte';
import { ScrollableBond } from './bond.svelte';

export const scrollable: BondAttachment<ScrollableBond> =
	createBondAttachment<ScrollableBond>(ScrollableBond);
