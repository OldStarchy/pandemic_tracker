import { debounce } from './debounce';
import { ghettoUsing } from './ghettoUsing';

type CleanupFunc = (() => void) & Disposable;
function cleanupFunc(f: () => void): CleanupFunc {
	const result = f as CleanupFunc;
	result[Symbol.dispose] = result;
	return result;
}

export class Emitter<T> {
	private changeListeners = new Set<(data: T) => void>();
	private suppressors = new Set<object>();

	constructor() {
		this.triggerChange = debounce(this.triggerChange, 0);
	}

	onChange(handler: (data: T) => void): CleanupFunc {
		this.changeListeners.add(handler);

		return cleanupFunc(() => void this.changeListeners.delete(handler));
	}

	triggerChange(data: T): void {
		if (this.isSuppressed()) return;

		ghettoUsing([this.suppress()], (_) => {
			for (const handler of this.changeListeners) {
				handler(data);
			}
		});
	}

	suppress(): CleanupFunc {
		const suppressor = {};
		this.suppressors.add(suppressor);

		return cleanupFunc(() => void this.suppressors.delete(suppressor));
	}

	isSuppressed(): boolean {
		return this.suppressors.size > 0;
	}
}
