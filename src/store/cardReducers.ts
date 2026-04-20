import { PayloadAction } from '@reduxjs/toolkit';
import { Deck, DeckItem } from '../context/universe/Deck';
import { Universe } from './universeSlice';

export function createCards(
	state: Universe,
	{
		payload,
	}: PayloadAction<{
		targetDeckId: Deck['id'];
		targetIndex: number;
		names: string[];
	}>,
): void {
	const newCards = payload.names.map((name) => ({
		id: crypto.randomUUID(),
		name,
	}));

	const deck = state.decks.find((deck) => deck.id === payload.targetDeckId);

	if (!deck)
		throw new Error(
			`Target deck ${payload.targetDeckId} not found when creating cards`,
		);

	deck.items.splice(
		payload.targetIndex,
		0,
		...newCards.map(
			(card): DeckItem => ({
				type: 'card',
				cardId: card.id,
			}),
		),
	);

	state.cards.push(...newCards);
}

export function destroyCards(
	state: Universe,
	{
		payload,
	}: PayloadAction<{
		cardIds: string[];
	}>,
): void {
	const cardIds = new Set(payload.cardIds);

	for (const id of cardIds) {
		const card = state.cards.find((card) => card.id === id);

		if (!card)
			throw new Error(`Card ${id} not found when destroying cards`);

		cardIds.add(id);
	}

	// Remove all the cards from the global card list
	state.cards = state.cards.filter((card) => !cardIds.has(card.id));

	// Remove the cards from the groups. If removed from a group, instances of that group need to be removed from decks
	const groupItemsRemovedById: Record<string, number> = {};
	const emptyGroupIds = new Set<string>();
	for (const group of state.groups) {
		const toRemove = group.cardIds.intersection(cardIds);

		if (toRemove.size > 0) {
			group.cardIds = group.cardIds.difference(toRemove);
			groupItemsRemovedById[group.id] = toRemove.size;
			if (group.cardIds.size === 0) {
				emptyGroupIds.add(group.id);
			}
		}
	}
	state.groups = state.groups.filter((group) => !emptyGroupIds.has(group.id));

	// Remove the cards from the decks, and remove instances of groups that have also had cards removed
	for (const deck of state.decks) {
		deck.items = deck.items.filter((c) => {
			if (c.type === 'card' && cardIds.has(c.cardId)) return false;
			if (c.type === 'group') {
				if (groupItemsRemovedById[c.groupId] > 0) {
					groupItemsRemovedById[c.groupId]--;
					return false;
				}
			}

			return true;
		});
	}
}
