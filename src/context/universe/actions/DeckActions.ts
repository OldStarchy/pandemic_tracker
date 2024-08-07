import { Card } from '../Card';
import CardUtil from '../CardUtil';
import { Deck, DeckItem } from '../Deck';
import { Group } from '../Group';
import { Universe } from '../Universe';

export const ACTION_CREATE_DECK = 'ACTION_CREATE_DECK';

interface CreateDeckAction {
	type: typeof ACTION_CREATE_DECK;
	id: string;
}

export function createDeck(id: string): CreateDeckAction {
	return { type: ACTION_CREATE_DECK, id };
}

export function createDeckReducer(
	state: Universe,
	action: CreateDeckAction,
): Universe {
	if (state.decks.some((deck) => deck.id === action.id)) {
		return state;
	}

	const newDeck: Deck = {
		id: action.id,
		items: [],
	};

	return {
		...state,
		decks: [...state.decks, newDeck],
	};
}

export const ACTION_MOVE_CARD = 'ACTION_MOVE_CARD';

interface MoveCardAction {
	type: typeof ACTION_MOVE_CARD;
	fromDeckId: Deck['id'];
	fromIndex: number;
	toDeckId: Deck['id'];
	toIndex: number;
	count: number;
}

export function moveCard(
	fromDeckId: Deck['id'],
	fromIndex: number,
	toDeckId: Deck['id'],
	toIndex: number,
	count: number,
): MoveCardAction {
	return {
		type: ACTION_MOVE_CARD,
		fromDeckId,
		fromIndex,
		toDeckId,
		toIndex,
		count,
	};
}

export function moveCardReducer(
	state: Universe,
	action: MoveCardAction,
): Universe {
	const fromDeck = state.decks.find((deck) => deck.id === action.fromDeckId);
	const toDeck = state.decks.find((deck) => deck.id === action.toDeckId);

	if (!fromDeck || !toDeck) {
		return state;
	}

	let fromIndex = action.fromIndex;
	if (fromIndex < 0) fromIndex += fromDeck.items.length;

	let toIndex = action.toIndex;
	// +1 to allow inserting at -1 => last position ie. (length - 1 + 1)
	if (toIndex < 0) toIndex += toDeck.items.length + 1;

	const count =
		action.count === -1 ? fromDeck.items.length - fromIndex : action.count;

	const items = fromDeck.items.slice(fromIndex, fromIndex + count);

	if (items.length !== count) {
		return state;
	}

	const newFromDeck = {
		...fromDeck,
		items: fromDeck.items
			.slice(0, fromIndex)
			.concat(fromDeck.items.slice(fromIndex + count)),
	};

	const newToDeck = {
		...toDeck,
		items: toDeck.items
			.slice(0, toIndex)
			.concat(items, toDeck.items.slice(toIndex)),
	};

	const decks = state.decks.map((deck) => {
		if (deck.id === action.fromDeckId) {
			return newFromDeck;
		}

		if (deck.id === action.toDeckId) {
			return newToDeck;
		}

		return deck;
	});

	return {
		...state,
		decks,
	};
}

export const ACTION_SHUFFLE_DECK = 'ACTION_SHUFFLE_DECK';

interface ShuffleDeckAction {
	type: typeof ACTION_SHUFFLE_DECK;
	deckId: Deck['id'];
}

export function shuffleDeck(deckId: Deck['id']): ShuffleDeckAction {
	return { type: ACTION_SHUFFLE_DECK, deckId };
}

export function shuffleDeckReducer(
	state: Universe,
	action: ShuffleDeckAction,
): Universe {
	const deckToShuffle = state.decks.find((deck) => deck.id === action.deckId);

	if (!deckToShuffle) {
		return state;
	}

	const uniqueCardNames = new Set(
		deckToShuffle.items.flatMap((item) => {
			if (item.type === 'card')
				return CardUtil.getCardName(state, item.cardId);

			const group = state.groups.find(
				(group) => group.id === item.groupId,
			)!;
			return Array.from(group.cardIds).map((cardId) =>
				CardUtil.getCardName(state, cardId),
			);
		}),
	);

	if (uniqueCardNames.size <= 1) return state;

	const numberOfItemsFromEachGroup: Record<string, number> = {};
	for (const item of deckToShuffle.items) {
		if (item.type === 'group') {
			numberOfItemsFromEachGroup[item.groupId] =
				(numberOfItemsFromEachGroup[item.groupId] ?? 0) + 1;
		}
	}

	const allGroupsInThisDeckAreFullyInThisDeck = Array.from(
		Object.entries(numberOfItemsFromEachGroup),
	).every(([groupId, count]) => {
		const group = state.groups.find((group) => group.id === groupId);

		if (!group) return false;

		if (count === group.cardIds.size) return true;

		return false;
	});

	if (!allGroupsInThisDeckAreFullyInThisDeck) return state;

	const groupsToDelete = Object.keys(numberOfItemsFromEachGroup);

	const cardsInNewGroup: Card['id'][] = [];

	for (const item of deckToShuffle.items) {
		if (item.type === 'card') {
			cardsInNewGroup.push(item.cardId);
		}
	}

	for (const groupId of groupsToDelete) {
		const group = state.groups.find((group) => group.id === groupId)!;

		cardsInNewGroup.push(...group.cardIds);
	}

	const newGroup: Group = {
		id: crypto.randomUUID(),
		cardIds: new Set(cardsInNewGroup),
	};

	return {
		...state,
		groups: [
			...state.groups.filter(
				(group) => !groupsToDelete.includes(group.id),
			),
			newGroup,
		],
		decks: state.decks.map((deck) => {
			if (deck.id === action.deckId) {
				return {
					...deck,
					items: cardsInNewGroup.map(
						(): DeckItem => ({
							type: 'group',
							groupId: newGroup.id,
						}),
					),
				};
			}

			return deck;
		}),
	};
}

type DeckActions = CreateDeckAction | MoveCardAction | ShuffleDeckAction;

export default DeckActions;
