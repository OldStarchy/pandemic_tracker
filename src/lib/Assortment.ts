import { Card } from './Card';

/**
 * An unordered set of cards stored as a map of `Card` -> count.
 */
export type Assortment = Map<Card, number>;

export namespace Assortment {
	export function clone(deck: Assortment): Assortment {
		return new Map(deck);
	}

	/**
	 * Creates a Assortment that contains all cards from both `a` and `b`.
	 */
	export function merge(a: Assortment, b: Assortment): Assortment {
		const result: Assortment = new Map(a);
		for (const [card, count] of b) {
			result.set(card, (result.get(card) ?? 0) + count);
		}
		return result;
	}

	/**
	 * Creates an Assortment that contains all cards from `b` except those in `a`.
	 *
	 * @throws {Error} If `b` contains cards not in `a`.
	 */
	export function subtract(a: Assortment, b: Assortment): Assortment {
		const result: Assortment = new Map(a);
		for (const [name, count] of b) {
			const resultCount = (result.get(name) ?? 0) - count;

			if (resultCount > 0) {
				result.set(name, resultCount);
			} else if (resultCount === 0) {
				result.delete(name);
			} else {
				throw new Error('Subtracting more cards than available');
			}
		}

		return result;
	}

	/**
	 * Finds all common cards between `a` and `b`.
	 *
	 * Can be used as a safeguard before subtracting if `b` has more cards than `a`.
	 * eg.
	 * ```
	 * declare const a: Assortment;
	 * declare const b: Assortment;
	 *
	 * const common = Assortment.intersect(a, b);
	 * const aMinusB = Assortment.subtract(a, common);
	 * ```
	 */
	export function intersect(a: Assortment, b: Assortment): Assortment {
		const result: Assortment = new Map();
		for (const [card, count] of a) {
			if (b.has(card)) {
				result.set(card, Math.min(count, b.get(card)!));
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
		from: Assortment,
		to: Assortment,
		selection: Assortment
	): { from: Assortment; to: Assortment } | null {
		const newFrom = subtract(from, selection);
		const newTo = merge(to, selection);

		return {
			from: newFrom,
			to: newTo,
		};
	}

	/**
	 * Moves as many cards `selected` cards from `from` and to `to` as possible.
	 * Any cards that were not in `from` are returned as `remainder`.
	 */
	export function tryMoveCards(
		from: Assortment,
		to: Assortment,
		selection: Assortment
	): { from: Assortment; to: Assortment; remainder: Assortment } | null {
		const common = intersect(from, selection);
		const newFrom = subtract(from, common);
		const newTo = merge(to, common);
		const remainder = subtract(selection, common);

		return {
			from: newFrom,
			to: newTo,
			remainder,
		};
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
}
