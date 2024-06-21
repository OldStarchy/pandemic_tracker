import { Card } from './Card';
import { IPossibleCard } from './Deck';
import { IMutable, Mutable } from './Mutable';

/**
 * An unordered set of cards stored as a map of `Card` -> count.
 */
export interface IAssortment extends IMutable {
	cards: Map<Card, number>;
}

export interface IReadonlyAssortment {
	cards: ReadonlyMap<Card, number>;
}

export class Assortment extends Mutable implements IAssortment {
	constructor(public cards: Map<Card, number>) {
		super();
	}
}

function pickRandom<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export namespace Assortment {
	export function getCardOptions(possible: IPossibleCard): Card[] {
		if (possible instanceof Card) return [possible];

		return [...possible.cards.keys()];
	}

	export function reveal(possible: IPossibleCard): Card {
		if (possible instanceof Card) {
			return possible;
		}

		const anyCard = pickRandom([...possible.cards.keys()]);

		subtract(possible, new Assortment(new Map([[anyCard, 1]])));

		return anyCard;
	}
	export function clone(deck: IReadonlyAssortment): IAssortment {
		return new Assortment(new Map(deck.cards));
	}

	/**
	 * Copies all cards from {@link from} to {@link into}. {@link from} is not modified.
	 */
	export function merge(into: IAssortment, from: IReadonlyAssortment): void {
		for (const [card, count] of from.cards) {
			into.cards.set(card, (into.cards.get(card) ?? 0) + count);
		}

		into.triggerChange();
	}

	/**
	 * Removes {@link b} from {@link from}. {@link from} is not modified.
	 *
	 * @throws {Error} If {@link b} contains cards not in {@link from}.
	 */
	export function subtract(from: IAssortment, b: IReadonlyAssortment): void {
		let changed = false;

		try {
			for (const [name, count] of b.cards) {
				const resultCount = (from.cards.get(name) ?? 0) - count;

				if (resultCount > 0) {
					from.cards.set(name, resultCount);
					changed = true;
				} else if (resultCount === 0) {
					from.cards.delete(name);
					changed = true;
				} else {
					throw new Error('Subtracting more cards than available');
				}
			}
		} finally {
			if (changed) {
				from.triggerChange();
			}
		}
	}

	/**
	 * Finds all common cards between {@link a} and {@link b}.
	 *
	 * Can be used as a safeguard before subtracting if {@link b} has more cards than {@link a}.
	 * eg.
	 * ```
	 * declare const a: Assortment;
	 * declare const b: Assortment;
	 *
	 * const common = Assortment.intersect(a, b);
	 * const aMinusB = Assortment.subtract(a, common);
	 * ```
	 */
	export function intersect(
		a: IReadonlyAssortment,
		b: IReadonlyAssortment
	): IAssortment {
		const result: IAssortment = new Assortment(new Map());
		for (const [card, count] of a.cards) {
			if (b.cards.has(card)) {
				result.cards.set(card, Math.min(count, b.cards.get(card)!));
			}
		}
		return result;
	}

	/**
	 * Moves the `selection` cards from `from` and to `to`.
	 *
	 * @throws {Error} If `from` does not contain all the selected cards.
	 */
	export function moveCards(
		from: IAssortment,
		to: IAssortment,
		selection: IReadonlyAssortment
	): void {
		subtract(from, selection);
		merge(to, selection);
	}

	/**
	 * Moves as many cards `selected` cards from `from` and to `to` as possible.
	 * Any cards that were not in `from` are returned as `remainder`.
	 */
	export function tryMoveCards(
		from: IAssortment,
		to: IAssortment,
		selection: IReadonlyAssortment
	): IAssortment {
		const common = intersect(from, selection);
		subtract(from, common);
		merge(to, common);

		const remainder = clone(selection);
		subtract(remainder, common);

		return remainder;
	}

	/**
	 * Given a total number of cards, and a number of "interesting", calculate the chance of drawing at least one "interesting" card after a number of draws.
	 *
	 * @param totalCount The total number of cards in the deck.
	 * @param cardCount The number of "interesting" cards in the deck.
	 * @param drawCount The number of draws to simulate.
	 */
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

	/**
	 * Returns the total number of cards in the assortment.
	 */
	export function getTotalCardCount(assortment: IReadonlyAssortment): number {
		let total = 0;
		for (const count of assortment.cards.values()) {
			total += count;
		}
		return total;
	}

	/**
	 * Returns the number of {@link card} in the assortment.
	 */
	export function getCardCount(
		assortment: IReadonlyAssortment,
		card: Card
	): number {
		return assortment.cards.get(card) ?? 0;
	}
}
