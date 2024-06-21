import fuzzy from 'fuzzy';
import { cities } from '../data/cities';

/**
 * An idempotent Card object. Care shouild be taken not to duplicate cards.
 */
export class Card implements Card {
	static #cardBag: Card[] = [];

	static get({
		name,
		type,
	}: {
		name: string;
		type: 'City' | 'Epidemic' | 'Other';
	}): Card {
		const existingCard = this.#cardBag.find(
			(card) => card.name === name && card.type === type
		);

		if (existingCard) {
			return existingCard;
		}

		const card = new Card(name, type);
		this.#cardBag.push(card);
		return card;
	}

	readonly image?: string;

	private constructor(
		readonly name: string,
		readonly type: 'City' | 'Epidemic' | 'Other'
	) {
		switch (type) {
			case 'City':
				if (cities.includes(name)) {
					this.image = `/images/cities/${name}.png`;
				}
				break;
			case 'Epidemic':
				this.image = '/images/epidemic.png';
				break;
		}
	}

	static select(
		cards: readonly Card[],
		filter: Readonly<{ name: string; fuzzy?: boolean } | { type: string }>
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
		} else {
			return cards.filter((card) => card.type === filter.type);
		}
	}
}
