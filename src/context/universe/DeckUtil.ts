import { Card } from './Card';
import CardUtil from './CardUtil';
import { Deck, DeckItem } from './Deck';
import { Group } from './Group';
import { Universe } from './Universe';

export default class DeckUtil {
	private constructor() {}

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
		drawCount: number,
	): number {
		if (drawCount < 0) {
			throw new Error('drawCount must be non-negative');
		}

		if (drawCount === 0) {
			return 0;
		}

		const imaginedAssortments = new Map<
			Group['id'],
			{ totalCount: number; cardCount: number }
		>();

		let totalChance = 0;
		const lim = Math.min(deck.items.length, drawCount);
		for (let index = 0; index < lim; index++) {
			const possibleCard = deck.items[index];

			let totalCount: number;
			let cardCount: number;

			if (possibleCard.type === 'card') {
				if (
					CardUtil.getCardName(universe, possibleCard.cardId) === card
				) {
					return 1;
				} else continue;
			}

			const group = universe.groups.find(
				(g) => g.id === possibleCard.groupId,
			)!;

			if (!imaginedAssortments.has(possibleCard.groupId)) {
				totalCount = group.cardIds.size;
				cardCount = Array.from(group.cardIds).filter(
					(c) => CardUtil.getCardName(universe, c) === card,
				).length;

				imaginedAssortments.set(possibleCard.groupId, {
					totalCount,
					cardCount,
				});
			} else {
				const img = imaginedAssortments.get(possibleCard.groupId)!;
				totalCount = img.totalCount;
				cardCount = img.cardCount;
			}

			const chance = cardCount / totalCount;

			totalChance += (1 - totalChance) * chance;

			imaginedAssortments.set(possibleCard.groupId, {
				totalCount: totalCount - 1,
				cardCount,
			});
		}

		return totalChance;
	}

	static getCardOptions(universe: Universe, item: DeckItem) {
		switch (item.type) {
			case 'card':
				return [CardUtil.getCardName(universe, item.cardId)!];

			case 'group':
				return Array.from(
					universe.groups.find((g) => g.id === item.groupId)!.cardIds,
				).map((id) => CardUtil.getCardName(universe, id)!);

			default:
				const _exhaustiveCheck: never = item;
				void _exhaustiveCheck;
		}
	}
}
