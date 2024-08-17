import { Card } from '../context/universe/Card';
import { Deck } from '../context/universe/Deck';
import { Group } from '../context/universe/Group';
import { Universe } from '../context/universe/Universe';
import { DISCARD_DECK, INFECTION_DECK } from './consts';

interface SaveFormatV0 {
	infectionDeck: DeckSaveFormatV0;
	discardDeck: DeckSaveFormatV0;
	drawCount: number;
}

interface DeckSaveFormatV0 {
	name: string;
	cards: { item: string | number; count: number }[];
	assortments: { id: number; cards: Record<string, number> }[];
}

interface SaveFormatV1 {
	version: '1';
	universe: {
		cards: CardSaveFormatV1[];
		decks: DeckSaveFormatV1[];
		groups: GroupSaveFormatV1[];
	};
	drawCount: number;
}

interface DeckSaveFormatV1 {
	id: string;
	items: DeckItemSaveFormatV1[];
}

type DeckItemSaveFormatV1 =
	| {
			type: 'card';
			cardId: string;
	  }
	| {
			type: 'group';
			groupId: string;
	  };

interface CardSaveFormatV1 {
	id: string;
	name: string;
}

interface GroupSaveFormatV1 {
	id: string;
	cardIds: string[];
}

interface WDeck {
	id: string;
	items: WDeckItem[];
}
type WDeckItem =
	| {
			type: 'card';
			cardId: Card['id'];
	  }
	| {
			type: 'group';
			groupId: Group['id'];
	  };

interface WGroup {
	id: string;
	cardIds: Set<Card['id']>;
}

export function loadSave(data: SaveFormatV0 | SaveFormatV1): {
	universe: Universe;
	drawCount: number;
} {
	if ('version' in data) {
		return {
			universe: {
				cards: data.universe.cards,
				decks: data.universe.decks,
				groups: data.universe.groups.map((group) => ({
					...group,
					cardIds: new Set(group.cardIds),
				})),
			},
			drawCount: data.drawCount,
		};
	} else {
		const cards: Card[] = [];
		const decks: Deck[] = [];
		const groups: Group[] = [];

		function readDeck(deck: DeckSaveFormatV0, toDeck: WDeck) {
			const groupIdMap = new Map<number, WGroup>();

			for (const card of deck.cards) {
				if (typeof card.item === 'string') {
					const name = card.item;
					const cards = Array.from({ length: card.count }, () => ({
						id: crypto.randomUUID(),
						name,
					}));
					cards.push(...cards);
					toDeck.items.push(
						...cards.map((card) => ({
							type: 'card' as const,
							cardId: card.id,
						})),
					);
				} else {
					const groupId = card.item;

					if (!groupIdMap.has(groupId)) {
						const group: WGroup = {
							id: crypto.randomUUID(),
							cardIds: new Set(),
						};
						groupIdMap.set(groupId, group);
						groups.push(group);
					}

					const group = groupIdMap.get(groupId)!;

					toDeck.items.push(
						...Array.from({ length: card.count }, () => ({
							type: 'group' as const,
							groupId: group.id,
						})),
					);
				}
			}

			for (const assortment of deck.assortments) {
				const group = groupIdMap.get(assortment.id)!;

				for (const [name, count] of Object.entries(assortment.cards)) {
					const assortmentCards = Array.from(
						{ length: count },
						() => ({
							id: crypto.randomUUID(),
							name,
						}),
					);
					cards.push(...assortmentCards);
					assortmentCards.forEach((card) =>
						group.cardIds.add(card.id),
					);
				}
			}
		}

		const infectionDeck: WDeck = {
			id: INFECTION_DECK,
			items: [],
		};
		const discardDeck: WDeck = {
			id: DISCARD_DECK,
			items: [],
		};

		decks.push(infectionDeck, discardDeck);

		readDeck(data.infectionDeck, infectionDeck);
		readDeck(data.discardDeck, discardDeck);

		return {
			universe: {
				cards,
				decks,
				groups,
			},
			drawCount: data.drawCount,
		};
	}
}

export function createSave(data: {
	universe: Universe;
	drawCount: number;
}): SaveFormatV1 {
	return {
		version: '1',
		universe: {
			cards: data.universe.cards.map((card) => ({
				id: card.id,
				name: card.name,
			})),
			decks: data.universe.decks.map((deck) => ({
				id: deck.id,
				items: deck.items.map((item) => {
					if (item.type === 'card') {
						return {
							type: 'card',
							cardId: item.cardId,
						};
					} else {
						return {
							type: 'group',
							groupId: item.groupId,
						};
					}
				}),
			})),
			groups: data.universe.groups.map((group) => ({
				id: group.id,
				cardIds: Array.from(group.cardIds),
			})),
		},
		drawCount: data.drawCount,
	};
}
