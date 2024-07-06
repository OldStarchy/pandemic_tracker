// Creact React App won't let me use the `using` keyword
export function ghettoUsing<T extends Disposable[]>(
	disposables: T,
	f: (...args: T) => void
): void {
	const e: unknown[] = [];

	try {
		f(...disposables);
	} catch (err: unknown) {
		e.push(err);
	} finally {
		for (let i = disposables.length - 1; i >= 0; i--) {
			const disposable = disposables[i];
			try {
				disposable[Symbol.dispose]();
			} catch (err: unknown) {
				e.push(err);
			}
		}
	}

	if (e.length > 0) {
		if (e.length === 1) throw e[0];

		throw new Error('Errors occured in ghettoUsing', { cause: e });
	}
}
