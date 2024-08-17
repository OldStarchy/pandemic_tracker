import { PayloadAction } from '@reduxjs/toolkit';
import { Card } from '../context/universe/Card';
import CardUtil from '../context/universe/CardUtil';
import { Deck } from '../context/universe/Deck';
import { Group } from '../context/universe/Group';
import { Universe } from './universeSlice';

export function revealCard(
	state: Universe,
	{
		payload,
	}: PayloadAction<{
		deckId: Deck['id'];
		index: number;
		as: Card['id'];
	}>,
): void {
	const deck = state.decks.find((deck) => deck.id === payload.deckId);

	if (!deck) {
		throw new Error(`Deck ${payload.deckId} not found when revealing card`);
	}

	const item = deck.items.at(payload.index);

	if (!item)
		throw new Error(`Item ${payload.index} not found when revealing card`);

	if (item.type !== 'group')
		throw new Error(
			`Item ${payload.index} in ${payload.deckId} is already revealed`,
		);

	const group = state.groups.find((group) => group.id === item.groupId);

	if (!group) throw new Error(`Trying to reveal card in non-existent group`);

	const asCard = payload.as;

	const asCardId = Array.from(group.cardIds).find(
		(cid) => CardUtil.getCardName(state, cid) === asCard,
	);

	if (asCardId === undefined)
		throw new Error(
			`Card ${asCard} is not possibly in position ${payload.index} of deck ${payload.deckId}`,
		);

	group.cardIds.delete(asCardId);

	revealSingletonGroups(state);
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

	for (const deck of state.decks) {
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

		if (irreducible) continue;

		for (let i = 0; i < deck.items.length; i++) {
			const item = deck.items[i];

			if (item.type !== 'group') {
				continue;
			}

			const groupCardIds = reducableGroupIdCardIdsMap[item.groupId];

			if (!groupCardIds) continue;

			const cardId = groupCardIds.pop()!;

			deck.items[i] = {
				type: 'card',
				cardId,
			};
		}
	}

	state.groups = state.groups.filter(
		(group) => !reducableGroupIdCardIdsMap[group.id],
	);
}
