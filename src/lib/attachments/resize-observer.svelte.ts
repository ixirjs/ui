// unobserves on cleanup.
export function resizeObserver(
	callback: ResizeObserverCallback,
	options?: ResizeObserverOptions | undefined
) {
	return (element: Element) => {
		const observer = new ResizeObserver(callback);
		observer.observe(element, options);

		return () => observer.unobserve(element);
	};
}
