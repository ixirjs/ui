import type { QRCodeBrowser } from '@qrcode-js/browser';
import type { PlainPartProps } from '$ixirjs/ui/authoring';

type QRCodeOptions = Parameters<ReturnType<typeof QRCodeBrowser>['setOptions']>[0];

// The code IS its `<div>` — see `PlainPartProps` for what that gives up (`as`, `base`, motion).
export interface QRCodeProps extends PlainPartProps<'div'> {
	/** Current value of the control. */
	value?: string | undefined;
	/** Styling for the three large corner squares a scanner locks onto. */
	finder?: QRCodeOptions['finder'] | undefined;
	/** Styling for the data modules: shape, colour and scale. */
	dots?: QRCodeOptions['dots'] | undefined;
	/** Replaces the module-drawing routine entirely, for a fully custom rendering. */
	drawFunction?: QRCodeOptions['drawFunction'] | undefined;
	/** Gradient applied across the code instead of a flat colour. Keep contrast high or scanners fail. */
	gradient?: QRCodeOptions['gradient'] | undefined;
	/** Image drawn over the centre. Error correction covers a small one; an oversized logo makes the code unreadable. */
	logo?: QRCodeOptions['logo'] | undefined;
	/** Quiet-zone size around the code. Scanners need some; zero often fails. */
	margin?: QRCodeOptions['margin'] | undefined;
	/** Encoding options: version, error-correction level and mask. */
	qr?: QRCodeOptions['qr'] | undefined;
}
