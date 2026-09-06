// Frozen server output, checked against the real SSR renderer in disclosure.spec.ts.
// The browser hydrates these same bytes; this is not a client-rendered stand-in for SSR.
export const disclosureHtml =
	'<!--[--><!--$s1--><div class="border-border flex w-full flex-col overflow-hidden" id="collapsible-root-s1"><div class="border-border flex cursor-pointer items-center gap-2" id="collapsible-header-s1" role="button" tabindex="0" aria-disabled="false" aria-controls="collapsible-body-s1" aria-expanded="true" data-state="open">Toggle</div><!----> <div class="border-border" id="collapsible-body-s1" role="region" aria-labelledby="collapsible-header-s1" data-state="open">Body</div><!----></div><!--]-->';
