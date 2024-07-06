// Creact React App won't let me use the `using` keyword
export async function asyncGhettoUsing<T extends AsyncDisposable[]>(
	disposables: T,
	f: (...args: T) => Promise<void>
): Promise<void> {
	const e: unknown[] = [];

	try {
		await f(...disposables);
	} catch (err: unknown) {
		e.push(err);
	} finally {
		for (let i = disposables.length - 1; i >= 0; i--) {
			const disposable = disposables[i];
			try {
				await disposable[Symbol.asyncDispose]();
			} catch (err: unknown) {
				e.push(err);
			}
		}
	}

	if (e.length > 0) {
		if (e.length === 1) throw e[0];

		throw new Error('Errors occured in asyncGhettoUsing', { cause: e });
	}
}
