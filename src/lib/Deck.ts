
export interface PossibleCard {
	assortment: Assortment;
}

export interface Deck {
	readonly name: string;
	cards: Card[];
}

import {Card} from './Card';
import {Selection} from './Selection';

export interface Assortment {
	readonly cards: Map<Card, number>;
}

export namespace Assortment {
	export function clone(deck: Assortment): Assortment {
		return {
			cards: new Map(
				Array.from(deck.cards.entries()).map(
					([card, count]) => [Card.clone(card), count]
				)
			),
		};
	}

	export function removeCards(
		from: Card[],
		selection: Selection,
		keepEmpty: boolean
	): Card[] {
		const moved: Record<string, Card> = {};

		let newFromCards = from.map((card) => {
			const transferCount = selection[card.name] ?? 0;

			if (transferCount > card.count) {
				throw new Error('Transfer count exceeds card count');
			}

			if (transferCount === 0) return card;

			moved[card.name] = { ...card, count: transferCount };

			return Card.clone({
				...card,
				count: card.count - transferCount,
			});
		});

		if (Object.entries(moved).length === 0) {
			return from;
		}

		if (!keepEmpty) {
			newFromCards = newFromCards.filter(
				(card) => card.count > 0 || !moved[card.name]
			);
		}

		return newFromCards;
	}

	export function moveCards(
		from: Assortment,
		to: Assortment,
		selection: Selection,
		keepEmpty: boolean
	): { from: Assortment; to: Assortment } {
		const moved: Record<string, Card> = {};
		let newFromCards = Array.from(from.cards).map((card) => {
			const transferCount = selection[card.name] ?? 0;

			if (transferCount > card.count) {
				throw new Error('Transfer count exceeds card count');
			}

			if (transferCount === 0) return card;

			moved[card.name] = { ...card, count: transferCount };

			return Card.clone({
				...card,
				count: card.count - transferCount,
			});
		});
		if (!keepEmpty) {
			newFromCards = newFromCards.filter((card) => card.count > 0);
		}

		if (Object.entries(moved).length === 0) {
			return { to, from } as const;
		}

		const newToCards = Array.from(to.cards).map((card) => {
			const movedCount = moved[card.name];

			if ((movedCount?.count ?? 0) === 0) return card;

			delete moved[card.name];

			return Card.clone({
				...card,
				count: card.count + movedCount.count,
			});
		});
		newToCards.push(...Object.values(moved));

		return {
			from: { ...from, cards: new Set(newFromCards) },
			to: { ...to, cards: new Set(newToCards) },
		} as const;
	}

	export function calculateDrawChance(
		totalCount: number,
		cardCount: number,
		drawCount: number
	): number {
		if (cardCount === 0) {
			return 0;
		}

		if (drawCount >= totalCount) {
			return 1;
		}

		if (drawCount === 1) {
			return cardCount / totalCount;
		} else {
			const chance = cardCount / totalCount;

			return (
				chance +
				(1 - chance) *
					calculateDrawChance(
						totalCount - 1,
						cardCount,
						drawCount - 1
					)
			);
		}
	}

	export function simplify(...cards: Card[]) {
		const result: Card[] = [];

		for (const card of cards) {
			const existing = result.find((c) => c.name === card.name);

			if (existing) {
				existing.count += card.count;
			} else {
				result.push(Card.clone(card));
			}
		}

		return result;
	}
}
