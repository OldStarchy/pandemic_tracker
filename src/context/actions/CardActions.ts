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
	id: string;
}

export function destroyCard(id: string): DestroyCardAction {
	return { type: ACTION_DESTROY_CARD, id };
}

export function destroyCardReducer(
	state: Universe,
	action: DestroyCardAction,
): Universe {
	const cardExists = state.cards.some((card) => card.id === action.id);

	if (!cardExists) {
		return state;
	}

	const cards = state.cards.filter((card) => card.id !== action.id);

	const decks = state.decks.map((deck) => {
		if (
			deck.items.some((c) => c.type === 'card' && c.cardId === action.id)
		) {
			return {
				...deck,
				items: deck.items.filter(
					(c) => c.type === 'card' && c.cardId !== action.id,
				),
			};
		}
		return deck;
	});

	const groups = state.groups.map((group) => {
		if (group.cardIds.has(action.id)) {
			const cards = new Set(group.cardIds);
			cards.delete(action.id);

			return {
				...group,
				cardIds: cards,
			};
		}

		return group;
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
