// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<TThis, TArgs extends any[]>(
	fn: (this: TThis, ...args: TArgs) => void,
	delay: number
): (...args: TArgs) => void {
	let timeout: ReturnType<typeof setTimeout> | undefined;

	return function (this: TThis, ...args: TArgs) {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			fn.call(this, ...args);
			timeout = undefined;
		}, delay);
	};
}
