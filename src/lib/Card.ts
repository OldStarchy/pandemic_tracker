import fuzzy from 'fuzzy';

/**
 * An idempotent Card object. Care shouild be taken not to duplicate cards.
 */
export interface Card {
	readonly name: string;
	readonly description?: string;
	readonly type: string;
	readonly image?: string;
}

export namespace Card {
	export function select(
		cards: Card[],
		filter: { name: string; fuzzy?: boolean } | { type: string }
	) {
		if ('name' in filter) {
			if (filter.fuzzy) {
				return fuzzy
					.filter(filter.name, cards, {
						extract: (card) => card.name,
					})
					.map((result) => result.original);
			}
			return cards.filter((card) => card.name === filter.name);
		} else {
			return cards.filter((card) => card.type === filter.type);
		}
	}
}
