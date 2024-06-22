import { Assortment, IAssortment, IReadonlyAssortment } from './Assortment';
import { Card } from './Card';
import { IMutable, Mutable } from './Mutable';

export type IPossibleCard = Card | IAssortment;
export type IReadonlyPossibleCard = Card | IReadonlyAssortment;

export interface IDeck extends IMutable {
	readonly name: string;
	cards: readonly IPossibleCard[];
	insert(cards: IPossibleCard[], index: number): void;
	remove(start: number, end: number): IPossibleCard[];
}

export interface IReadonlyDeck {
	readonly name: string;
	readonly cards: readonly IReadonlyPossibleCard[];
}

export class Deck extends Mutable implements IDeck {
	#cards: IPossibleCard[];

	get cards(): readonly IPossibleCard[] {
		return this.#cards;
	}

	#trackedAssortments = new Map<IAssortment, () => void>();

	constructor(public name: string) {
		super();
		this.#cards = [];
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toJson(): any {
		const assortments = this.cards.filter(
			(card) => card instanceof Assortment
		) as Assortment[];

		let nextId = 0;
		const ids = new Map<IAssortment, number>();

		assortments.forEach((assortment) => {
			if (!ids.has(assortment)) {
				ids.set(assortment, nextId++);
			}
		});

		const cards = this.cards
			.map((card) => {
				if (card instanceof Card) {
					return card.name;
				}

				const id = ids.get(card as IAssortment)!;
				return id;
			})
			.reduce((acc, card) => {
				const top = acc[acc.length - 1];

				if (!top || top.item !== card) {
					acc.push({ item: card, count: 1 });
				} else {
					top.count++;
				}
				return acc;
			}, [] as { item: string | number; count: number }[]);

		return {
			name: this.name,
			cards,
			assortments: [...ids.entries()].map(([assortment, id]) => {
				const cards = [...assortment.cards.entries()]
					.sort((a, b) => a[0].name.localeCompare(b[0].name))
					.reduce((acc, [card, count]) => {
						acc[card.name] = count;
						return acc;
					}, {} as Record<string, number>);
				return { id, cards };
			}),
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static fromJson(json: any): Deck {
		const deck = new Deck(json.name);
		const assortments = new Map<number, Assortment>();

		for (const assortment of json.assortments) {
			const cards = new Map<Card, number>();
			for (const [card, count] of Object.entries(assortment.cards) as [
				string,
				number
			][]) {
				cards.set(Card.get({ name: card }), count);
			}
			assortments.set(assortment.id, new Assortment(cards));
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const cards = json.cards.flatMap(
			(item: { item: string | number; count: number }) => {
				const val =
					typeof item.item === 'number'
						? assortments.get(item.item)!
						: Card.get({ name: item.item });

				return new Array(item.count).fill(val);
			}
		);

		deck.insert(cards, 0);

		return deck;
	}

	shuffle(): void {
		if (this.#cards.some((card) => card instanceof Assortment)) {
			throw new Error('Cannot shuffle a deck with assortments');
		}

		const cardCounts = new Map<Card, number>();

		for (const card of this.#cards as Card[]) {
			cardCounts.set(card, (cardCounts.get(card) ?? 0) + 1);
		}
		const assort = new Assortment(cardCounts);

		this.#cards.fill(assort);

		this.#trackAssortment(assort);

		this.triggerChange();
	}

	insert(cards: IPossibleCard[], index: number): void {
		if (index < 0) index += this.#cards.length + 1;

		this.#cards.splice(index, 0, ...cards);
		this.triggerChange();

		for (const card of cards) {
			if (card instanceof Assortment) {
				this.#trackAssortment(card);
			}
		}
	}

	#trackAssortment(assortment: Assortment): void {
		if (!this.#trackedAssortments.has(assortment)) {
			const removeListener = assortment.onChange(() => {
				if (assortment.cards.size === 1) {
					this.cleanup();
				}
				this.triggerChange();
			});

			this.#trackedAssortments.set(assortment, removeListener);
		}
	}

	peek(index: number): IPossibleCard | undefined {
		if (index < 0) index += this.#cards.length;

		return this.#cards[index];
	}

	remove(start: number, count: number): IPossibleCard[] {
		if (start < 0) start += this.#cards.length;

		const cards = this.#cards.splice(start, count);
		this.triggerChange();

		for (const card of cards) {
			if (card instanceof Assortment) {
				if (!this.cards.includes(card)) {
					const removeListener = this.#trackedAssortments.get(card);
					if (removeListener) {
						removeListener();
						this.#trackedAssortments.delete(card);
					}
				}
			}
		}

		return cards;
	}

	cleanup(): void {
		for (let repeat = 0; repeat < 2; repeat++) {
			for (let index = this.cards.length - 1; index >= 0; index--) {
				const card = this.cards[index];
				if (card instanceof Assortment && card.cards.size === 1) {
					const [realCard] = [...card.cards.keys()];
					Assortment.subtract(
						card,
						new Assortment(new Map([[realCard, 1]]))
					);
					this.#cards[index] = realCard;
				}
			}
		}
	}
}

export namespace Deck {
	// export function clone(deck: IReadonlyDeck): IDeck {
	// 	const result = new Deck(deck.name);
	// 	for (const card of deck.cards) {
	// 		result.cards.push(card);
	// 	}

	// 	return result;
	// }

	export function calculateDrawChance(
		deck: IReadonlyDeck,
		card: Card,
		drawCount: number
	): number {
		if (drawCount < 0) {
			throw new Error('drawCount must be non-negative');
		}

		if (drawCount === 0) {
			return 0;
		}

		const imaginedAssortments = new Map<
			IReadonlyAssortment,
			{ totalCount: number; cardCount: number }
		>();

		let totalChance = 0;
		const lim = Math.min(deck.cards.length, drawCount);
		for (let index = 0; index < lim; index++) {
			const possibleCard = deck.cards[index];

			let totalCount: number;
			let cardCount: number;

			if (possibleCard instanceof Card) {
				if (possibleCard === card) {
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
