import { Card } from '../Card';
import CardUtil from '../CardUtil';
import { Deck, DeckItem } from '../Deck';
import { Group } from '../Group';
import { Universe } from '../Universe';

export const ACTION_REVEAL_CARD = 'ACTION_REVEAL_CARD';

interface RevealCardAction {
	type: typeof ACTION_REVEAL_CARD;
	deckId: Deck['id'];
	index: number;
	as: Card['id'];
}

export function revealCard(
	deckId: Deck['id'],
	index: number,
	as: Card['id'],
): RevealCardAction {
	return { type: ACTION_REVEAL_CARD, deckId, index, as };
}

export function revealCardReducer(
	state: Universe,
	action: RevealCardAction,
): Universe {
	const deck = state.decks.find((deck) => deck.id === action.deckId);

	if (!deck) {
		return state;
	}

	const item = deck.items[action.index];

	if (item?.type !== 'group') return state;

	const group = state.groups.find((group) => group.id === item.groupId);

	if (!group) return state;

	let asCard: Card['id'];
	if (action.as) {
		asCard = action.as;
	} else {
		if (group.cardIds.size > 1) return state;

		asCard = group.cardIds.values().next().value;
	}

	const newGroupCardIds = Array.from(group.cardIds);

	const asCardIndex = newGroupCardIds.findIndex(
		(cid) => CardUtil.getCardName(state, cid) === asCard,
	);

	if (asCardIndex === -1) return state;

	const [revealedCardId] = newGroupCardIds.splice(asCardIndex, 1);

	const newGroup: Group = {
		...group,
		cardIds: new Set(newGroupCardIds),
	};

	const newDeck: Deck = {
		...deck,
		items: deck.items.map((item, index) => {
			if (index === action.index) {
				return {
					type: 'card',
					cardId: revealedCardId,
				};
			}

			return item;
		}),
	};

	const newDecks = state.decks.map((deck) => {
		if (deck.id === newDeck.id) {
			return newDeck;
		}

		return deck;
	});

	const newGroups = state.groups.map((group) => {
		if (group.id === newGroup.id) {
			return newGroup;
		}

		return group;
	});

	const newState = {
		...state,
		groups: newGroups,
		decks: newDecks,
	};

	return revealSingletonGroups(newState);
}

function revealSingletonGroups(state: Universe) {
	const reducableGroupIdCardIdsMap: Record<Group['id'], Card['id'][]> = {};

	for (const group of state.groups) {
		const cardNames = new Set(
			Array.from(group.cardIds).map((cid) =>
				CardUtil.getCardName(state, cid),
			),
		);
		const reducable = cardNames.size <= 1;

		if (reducable) {
			reducableGroupIdCardIdsMap[group.id] = Array.from(group.cardIds);
		}
	}

	if (Object.keys(reducableGroupIdCardIdsMap).length === 0) return state;

	const newDecks = state.decks.map((deck): Deck => {
		const irreducible = deck.items.every((item) => {
			switch (item.type) {
				case 'card':
					return true;

				case 'group': {
					return !reducableGroupIdCardIdsMap[item.groupId];
				}

				default: {
					const _exhaustiveCheck: never = item;
					return true;
				}
			}
		});

		if (irreducible) return deck;

		return {
			...deck,
			items: deck.items.map((item): DeckItem => {
				if (item.type === 'group') {
					const groupCardIds =
						reducableGroupIdCardIdsMap[item.groupId];

					if (!groupCardIds) return item;

					const cardId = groupCardIds.pop()!;

					return {
						type: 'card',
						cardId,
					};
				}

				return item;
			}),
		};
	});

	const newGroups = state.groups.filter(
		(group) => !reducableGroupIdCardIdsMap[group.id],
	);
	return {
		...state,
		groups: newGroups,
		decks: newDecks,
	};
}

type GroupActions = RevealCardAction;

export default GroupActions;
