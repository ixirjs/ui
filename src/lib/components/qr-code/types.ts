import type { QRCodeBrowser } from '@qrcode-js/browser';
import type { HtmlAtomProps } from '$ixirjs/ui/components/atom';

type QRCodeOptions = Parameters<ReturnType<typeof QRCodeBrowser>['setOptions']>[0];

export interface QRCodeProps extends HtmlAtomProps<'div'> {
	value?: string | undefined;
	finder?: QRCodeOptions['finder'] | undefined;
	dots?: QRCodeOptions['dots'] | undefined;
	drawFunction?: QRCodeOptions['drawFunction'] | undefined;
	gradient?: QRCodeOptions['gradient'] | undefined;
	logo?: QRCodeOptions['logo'] | undefined;
	margin?: QRCodeOptions['margin'] | undefined;
	qr?: QRCodeOptions['qr'] | undefined;
}
