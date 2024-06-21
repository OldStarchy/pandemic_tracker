export interface IMutable {
	onChange(handler: () => void): () => void;
	triggerChange(): void;
}

export abstract class Mutable {
	private changeListeners = new Set<() => void>();
	onChange(handler: () => void): () => void {
		this.changeListeners.add(handler);

		return () => this.changeListeners.delete(handler);
	}

	#triggering = false;
	#doTriggerChange(): void {
		if (this.#triggering) return;
		this.#triggering = true;
		try {
			for (const handler of this.changeListeners) {
				handler();
			}
		} finally {
			this.#triggering = false;
		}
	}

	#triggerTimeout: ReturnType<typeof setTimeout> | undefined;
	triggerChange(): void {
		if (this.#triggerTimeout) {
			clearTimeout(this.#triggerTimeout);
		}
		this.#triggerTimeout = setTimeout(() => {
			this.#doTriggerChange();
			this.#triggerTimeout = undefined;
		}, 0);
	}
}
