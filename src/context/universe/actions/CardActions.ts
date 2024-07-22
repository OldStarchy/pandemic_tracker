import { Deck, DeckItem } from '../Deck';
import { Universe } from '../Universe';

export const ACTION_CREATE_CARD = 'ACTION_CREATE_CARD';
interface CreateCardAction {
	type: typeof ACTION_CREATE_CARD;
	names: string[];
	targetDeckId: Deck['id'];
}

export function createCards(
	targetDeck: Deck['id'],
	...names: string[]
): CreateCardAction {
	return { type: ACTION_CREATE_CARD, names, targetDeckId: targetDeck };
}

export function createCardReducer(
	state: Universe,
	action: CreateCardAction,
): Universe {
	const newCards = action.names.map((name) => ({
		id: crypto.randomUUID(),
		name,
	}));

	const deck = state.decks.find((deck) => deck.id === action.targetDeckId);

	if (!deck) return state;

	const newDeck = {
		...deck,
		items: [
			...deck.items,
			...newCards.map(
				(card): DeckItem => ({
					type: 'card',
					cardId: card.id,
				}),
			),
		],
	};

	return {
		...state,
		decks: state.decks.map((d) =>
			d.id === action.targetDeckId ? newDeck : d,
		),
		cards: [...state.cards, ...newCards],
	};
}

export const ACTION_DESTROY_CARD = 'ACTION_DESTROY_CARD';
interface DestroyCardAction {
	type: typeof ACTION_DESTROY_CARD;
	ids: string[];
}

export function destroyCard(...ids: string[]): DestroyCardAction {
	return { type: ACTION_DESTROY_CARD, ids };
}

export function destroyCardReducer(
	state: Universe,
	action: DestroyCardAction,
): Universe {
	const cardExists = action.ids.some((id) =>
		state.cards.some((card) => card.id === id),
	);

	if (!cardExists) {
		return state;
	}

	const cards = state.cards.filter((card) => !action.ids.includes(card.id));

	const groupItemsRemovedById: Record<string, number> = {};

	const groups = state.groups.map((group) => {
		const newGroup = { ...group, cardIds: new Set(group.cardIds) };
		let anyDeleted = false;

		for (const id of action.ids) {
			if (newGroup.cardIds.has(id)) {
				newGroup.cardIds.delete(id);
				groupItemsRemovedById[group.id] =
					(groupItemsRemovedById[group.id] || 0) + 1;
				anyDeleted = true;
			}
		}

		if (anyDeleted) {
			return newGroup;
		}

		return group;
	});

	const decks = state.decks.map((deck) => {
		if (
			deck.items.some(
				(c) =>
					(c.type === 'card' && action.ids.includes(c.cardId)) ||
					(c.type === 'group' &&
						groupItemsRemovedById[c.groupId] > 0),
			)
		) {
			return {
				...deck,
				items: deck.items.filter((c) => {
					if (c.type === 'card' && action.ids.includes(c.cardId))
						return false;
					if (c.type === 'group') {
						if (groupItemsRemovedById[c.groupId] > 0) {
							groupItemsRemovedById[c.groupId]--;
							return false;
						}
					}

					return true;
				}),
			};
		}
		return deck;
	});

	return {
		...state,
		cards,
		decks,
		groups,
	};
}

type CardActions = CreateCardAction | DestroyCardAction;

export default CardActions;
