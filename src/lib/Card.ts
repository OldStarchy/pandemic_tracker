import fuzzy from 'fuzzy';

/**
 * An idempotent Card object. Care shouild be taken not to duplicate cards.
 */
export class Card implements Card {
	static #cardBag: Card[] = [];

	static get({ name }: { name: string }): Card {
		const existingCard = this.#cardBag.find((card) => card.name === name);

		if (existingCard) {
			return existingCard;
		}

		const card = new Card(name);
		this.#cardBag.push(card);
		return card;
	}

	private constructor(readonly name: string) {}

	static select(
		cards: Card[],
		filter: Readonly<{ name: string; fuzzy?: boolean }>
	): Card[] {
		if ('name' in filter) {
			if (filter.fuzzy) {
				return fuzzy
					.filter(filter.name, cards, {
						extract: (card) => card.name,
					})
					.map((result) => result.original);
			}
			return cards.filter((card) => card.name === filter.name);
		}
		return cards;
	}
}
