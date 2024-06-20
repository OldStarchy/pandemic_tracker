import { Card } from './Card';

export interface Selection {
	[cardName: string]: number;
}

export namespace Selection {
	export function from(cards: Card[]): Selection {
		const counts: Selection = {};
		for (const card of cards) {
			counts[card.name] = card.count;
		}
		return counts;
	}

	export function merge(a: Selection, b: Selection) {
		const result: Selection = { ...a };
		for (const [name, count] of Object.entries(b)) {
			result[name] = (result[name] ?? 0) + count;
		}
		return result;
	}

	export function subtract(a: Selection, b: Selection) {
		const result: Selection = { ...a };
		for (const [name, count] of Object.entries(b)) {
			result[name] = (result[name] ?? 0) - count;

			if (result[name] <= 0) {
				delete result[name];
			}
		}
		return result;
	}
}
