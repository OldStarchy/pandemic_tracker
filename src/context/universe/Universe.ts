import { Card } from './Card';
import { Deck } from './Deck';
import { Group } from './Group';

/** @deprecated moving to redux */
export interface Universe {
	readonly decks: readonly Deck[];
	readonly cards: readonly Card[];
	readonly groups: readonly Group[];
}

export namespace Universe {
	export function empty(): Universe {
		return {
			decks: [],
			cards: [],
			groups: [],
		};
	}
}
