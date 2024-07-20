import {Card} from './Card';
import CardUtil from './CardUtil';
import {Deck} from './Deck';
import {Group} from './Group';
import {Universe} from './Universe';

export default class DeckUtil {
	private constructor() { }

	// export function clone(deck: IReadonlyDeck): IDeck {
	// 	const result = new Deck(deck.name);
	// 	for (const card of deck.cards) {
	// 		result.cards.push(card);
	// 	}

	// 	return result;
	// }

	  static calculateDrawChance(
		universe: Universe,
		deck: Deck,
		card: Card['name'],
		drawCount: number
	): number {
		if (drawCount < 0) {
			throw new Error('drawCount must be non-negative');
		}

		if (drawCount === 0) {
			return 0;
		}

		const imaginedAssortments = new Map<
			Group,
			{ totalCount: number; cardCount: number }
		>();

		let totalChance = 0;
		const lim = Math.min(deck.items.length, drawCount);
		for (let index = 0; index < lim; index++) {
			const possibleCard = deck.items[index];

			let totalCount: number;
			let cardCount: number;

			if (possibleCard.type === 'card') {
				if (CardUtil.getCardName(universe, possibleCard.cardId) === card) {
					return 1;
				} else continue;
			}

			if (!imaginedAssortments.has(possibleCard)) {
				totalCount = Assortment.getTotalCardCount(possibleCard);
				cardCount = Assortment.getCardCount(possibleCard, card);

				imaginedAssortments.set(possibleCard, {
					totalCount,
					cardCount,
				});
			} else {
				const img = imaginedAssortments.get(possibleCard)!;
				totalCount = img.totalCount;
				cardCount = img.cardCount;
			}

			const chance = cardCount / totalCount;

			totalChance += (1 - totalChance) * chance;

			imaginedAssortments.set(possibleCard, {
				totalCount: totalCount - 1,
				cardCount,
			});
		}

		return totalChance;
	}
}
